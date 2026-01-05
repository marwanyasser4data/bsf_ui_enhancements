import requests

def download_pdf(url, file_path):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        with open(file_path, 'wb') as file:
            file.write(response.content)
        
        print(f"✓ PDF downloaded successfully as {file_path}")
        print(f"File size: {len(response.content) / 1024:.2f} KB")
        
    except requests.exceptions.RequestException as e:
        print(f"Error downloading PDF: {e}")

url = "https://www.saudiexchange.sa/Resources/fsPdf/381_0_2024-04-03_13-42-01_En.pdf"
download_pdf(url, "saudi_exchange_document.pdf")

