"""
Centralised logging configuration with per-session logging support.

This module provides session-specific logging capabilities that prevent
log conflicts between different users in a multi-user environment.

Additionally, configures the root logger to write system-level
(non-session-specific) logs to /logs/SYSTEM.log.
"""

import inspect
import logging
import os
import threading
import time
from typing import Optional

# Context manager for temporary session logging
class SessionLoggingContext:
    """Context manager to temporarily set session logging for a block of code."""

    def __init__(self, session_id: str, log_file_path: str):
        self.session_id = session_id
        self.log_file_path = log_file_path
        self.logger = None
        self.previous_logger = None
        self.previous_session_id = None

    def __enter__(self):
        # Store previous values
        self.previous_logger = SessionLogger.get_current_logger()
        self.previous_session_id = SessionLogger.get_current_session_id()

        # Create and set new logger
        self.logger = SessionLogger.create_session_logger(
            self.session_id, self.log_file_path
        )
        SessionLogger.set_session_logger(self.session_id, self.logger)

        return self.logger

    def __exit__(self, exc_type, exc_val, exc_tb):
        # Restore previous values
        if self.previous_logger and self.previous_session_id:
            SessionLogger.set_session_logger(
                self.previous_session_id, self.previous_logger
            )
        else:
            # Clear thread-local storage
            if hasattr(_thread_local, "logger"):
                delattr(_thread_local, "logger")
            if hasattr(_thread_local, "session_id"):
                delattr(_thread_local, "session_id")


class ExcludeFilter(logging.Filter):
    """Filter to exclude specific log records based on filename and function."""
    
    def __init__(self, exclude_patterns=None):
        super().__init__()
        self.exclude_patterns = exclude_patterns or []
    
    def filter(self, record):
        """Return False to exclude the record, True to include it."""
        for filename_pattern, func_pattern in self.exclude_patterns:
            if (record.filename == filename_pattern and 
                (func_pattern is None or record.funcName == func_pattern)):
                return False
        return True

# --- Root Logger Configuration (for SYSTEM logs only) ---
def _setup_root_logger():
    """Configure the root logger to log to /logs/SYSTEM.log only for SYSTEM/non-session logs."""
    log_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'logs')
    os.makedirs(log_dir, exist_ok=True)
    log_path = os.path.join(log_dir, "SYSTEM.log")
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Remove default handlers if already configured
    if root_logger.hasHandlers():
        for h in root_logger.handlers[:]:
            root_logger.removeHandler(h)
    
    system_formatter = logging.Formatter(
        "%(asctime)s - %(filename)s:%(lineno)d - %(funcName)s() - [SYSTEM] - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    
    file_handler = logging.FileHandler(log_path, mode="a", encoding="utf-8")
    file_handler.setFormatter(system_formatter)
    file_handler.setLevel(logging.INFO)
    
    # Add filter to exclude _client.py:_send_single_request()
    exclude_filter = ExcludeFilter(exclude_patterns=[
        ("_client.py", "_send_single_request"),
    ])
    file_handler.addFilter(exclude_filter)
    
    root_logger.addHandler(file_handler)


_setup_root_logger()

# Thread-local storage for session-specific loggers
_thread_local = threading.local()


class SessionLogger:
    """Manages session-specific logging with thread-local storage."""

    _session_loggers = {}  # Cache of created loggers
    _lock = threading.Lock()  # Thread lock for logger creation

    @classmethod
    def create_session_logger(
        cls, session_id: str, log_file_path: str, log_level=logging.INFO
    ):
        """
        Create a session-specific logger with proper isolation.

        Args:
            session_id (str): Unique session identifier
            log_file_path (str): Path to the session's log file
            log_level: Logging level (default: logging.INFO)

        Returns:
            logging.Logger: Session-specific logger
        """
        # Make logger name truly unique by adding timestamp
        logger_name = f"session_{session_id}_{int(time.time() * 1000000)}"

        with cls._lock:
            # Always create a new logger to avoid conflicts
            logger = logging.getLogger(logger_name)
            logger.setLevel(log_level)

            # Prevent propagation to root logger to avoid SYSTEM logs duplicating session logs
            logger.propagate = False

            # Clear any existing handlers to ensure clean state
            if logger.handlers:
                for handler in logger.handlers[:]:
                    handler.close()
                    logger.removeHandler(handler)

            # Ensure the log directory exists
            os.makedirs(os.path.dirname(log_file_path), exist_ok=True)

            # Create formatter with session info
            formatter = logging.Formatter(
                (
                    "%(asctime)s - %(filename)s:%(lineno)d - %(funcName)s() "
                    "- [Session: %(session_id)s] - %(message)s"
                ),
                datefmt="%Y-%m-%d %H:%M:%S",
            )

            # Create file handler with unique session file
            file_handler = logging.FileHandler(log_file_path, mode="a", encoding="utf-8")
            file_handler.setLevel(log_level)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)

            # Create console handler
            console_handler = logging.StreamHandler()
            console_handler.setLevel(log_level)
            console_handler.setFormatter(formatter)
            logger.addHandler(console_handler)

            # Store in cache with session_id as key for easy retrieval
            cls._session_loggers[session_id] = {
                "logger": logger,
                "logger_name": logger_name,
                "log_file_path": log_file_path,
            }

            return logger

    @classmethod
    def set_session_logger(cls, session_id: str, logger: logging.Logger):
        """
        Set the current thread's session logger.

        Args:
            session_id (str): Session identifier
            logger (logging.Logger): Logger instance for this session
        """
        _thread_local.session_id = session_id
        _thread_local.logger = logger

        # Debug info to help troubleshoot
        if hasattr(_thread_local, "logger") and _thread_local.logger:
            # print(
            #     (
            #         "DEBUG: Set session logger for session "
            #         f"{session_id[:8]} "
            #         "in thread "
            #         f"{threading.current_thread().name}"
            #     )
            # )
            # Log to the session-specific logger to verify it's working
            try:
                adapter = SessionLoggerAdapter(
                    _thread_local.logger, {"session_id": session_id[:8]}
                )
                adapter.info(
                    (
                        "Session logger activated for session "
                        f"{session_id[:8]} "
                        "in thread "
                        f"{threading.current_thread().name}"
                    ),
                    stacklevel=3
                )
            except Exception as e:
                print(f"DEBUG: Error logging to session logger: {e}")

    @classmethod
    def get_current_logger(cls) -> Optional[logging.Logger]:
        """
        Get the current thread's session logger.

        Returns:
            logging.Logger or None: Current session logger if available
        """
        logger = getattr(_thread_local, "logger", None)
        session_id = getattr(_thread_local, "session_id", None)

        # Debug info
        if logger:
            # print(
            #     (
            #         "DEBUG: Retrieved session logger for session "
            #         f"{session_id[:8] if session_id else 'unknown'} "
            #         "in thread "
            #         f"{threading.current_thread().name}"
            #     )
            # )
            pass
        else:
            print(
                f"DEBUG: No session logger found in thread {threading.current_thread().name}"
            )

        return logger

    @classmethod
    def get_current_session_id(cls) -> Optional[str]:
        """
        Get the current thread's session ID.

        Returns:
            str or None: Current session ID if available
        """
        return getattr(_thread_local, "session_id", None)

    @classmethod
    def cleanup_session_logger(cls, session_id: str):
        """
        Clean up a session logger and its handlers.

        Args:
            session_id (str): Session identifier to clean up
        """
        with cls._lock:
            if session_id in cls._session_loggers:
                session_info = cls._session_loggers[session_id]
                logger = session_info["logger"]
                logger_name = session_info["logger_name"]

                # Close and remove all handlers
                for handler in logger.handlers[:]:
                    handler.close()
                    logger.removeHandler(handler)

                # Remove from cache
                del cls._session_loggers[session_id]

                # Also remove from Python's logger registry
                if logger_name in logging.Logger.manager.loggerDict:
                    del logging.Logger.manager.loggerDict[logger_name]

    @classmethod
    def get_session_logger_by_id(cls, session_id: str) -> Optional[logging.Logger]:
        """
        Get a session logger by session ID.

        Args:
            session_id (str): Session identifier

        Returns:
            logging.Logger or None: Session logger if found
        """
        with cls._lock:
            session_info = cls._session_loggers.get(session_id)
            return session_info["logger"] if session_info else None


class SessionLoggerAdapter(logging.LoggerAdapter):
    """Adapter that automatically adds session ID to log records."""

    def process(self, msg, kwargs):
        session_id = SessionLogger.get_current_session_id()
        if session_id:
            return msg, {**kwargs, "extra": {"session_id": session_id[:8]}}
        return msg, kwargs


def add_origin_info(message: str, level: str = "info"):
    """
    Prepends origin information (the call stack) to a message in a concise format.
    The format is: message (called by file:func:line <- ... <- file:func:line)
    """
    # stack[0] is this function
    # stack[1] is the function that called this function (often an internal inspect call)
    # stack[2:] are the actual callers we care about
    # We reverse the slice [2:] so the stack reads from outermost caller to immediate caller
    callers = inspect.stack()[3:][::-1]
    callers.reverse()

    # Create a list of 'file:func:line' strings for all callers
    origin_parts = []
    for idx, frame_info in enumerate(callers):
        filename = os.path.basename(frame_info.filename)
        func = frame_info.function
        lineno = frame_info.lineno
        origin_parts.append(f"{filename}:{func}:{lineno}")
        if idx == 2: # 3 Parents
            break

    # Join the parts with the ' <- ' separator to show the flow of execution
    origin_info = " -> ".join(origin_parts)

    return f"[{level}] {message} (called by {origin_info})"

def _log_with_session(level: str, message: str, *args, session_id: str = None, **kwargs):
    """Internal helper for session-aware logging at any level."""
    
    # message = add_origin_info(message, level)
    
    # Determine session_id and logger
    if session_id == "SYSTEM":
        logger = None
    elif session_id:
        logger = SessionLogger.get_session_logger_by_id(session_id)
    else:
        session_id = SessionLogger.get_current_session_id()
        logger = SessionLogger.get_current_logger()
    
    # Log with appropriate handler
    if logger and session_id:
        adapter = SessionLoggerAdapter(logger, {"session_id": session_id[:8]})
        getattr(adapter, level)(message, *args, stacklevel=3, **kwargs)
    else:
        # Fallback to root logger
        session_prefix = f"[{session_id[:8]}]" if session_id else "[No Session]"
        getattr(logging, level)(f"{session_prefix} - {message}", *args, stacklevel=3, **kwargs)


def log_debug(message: str, *args, session_id: str = None, **kwargs):
    """Session-aware debug logging."""
    _log_with_session("debug", message, *args, session_id=session_id, **kwargs)


def log_info(message: str, *args, session_id: str = None, **kwargs):
    """Session-aware info logging."""
    _log_with_session("info", message, *args, session_id=session_id, **kwargs)


def log_warning(message: str, *args, session_id: str = None, **kwargs):
    """Session-aware warning logging."""
    _log_with_session("warning", message, *args, session_id=session_id, **kwargs)


def log_error(message: str, *args, session_id: str = None, **kwargs):
    """Session-aware error logging."""
    _log_with_session("error", message, *args, session_id=session_id, **kwargs)


def log_critical(message: str, *args, session_id: str = None, **kwargs):
    """Session-aware critical logging."""
    _log_with_session("critical", message, *args, session_id=session_id, **kwargs)


def init_pool_logger(sid: str):
    """Run once per worker thread."""
    logger = SessionLogger.get_session_logger_by_id(sid)
    if logger:                       # propagate the cached logger
        SessionLogger.set_session_logger(sid, logger)
