from flask import Flask, render_template, request, jsonify
import requests
import re
from bs4 import BeautifulSoup
from typing import List, Dict

app = Flask(__name__)

class MovieScraper:
    def __init__(self, base_url: str = "https://flixhq.to"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        })
    
    def search(self, query: str) -> List[Dict]:
        """Busca por filmes/séries"""
        search_query = query.strip().replace(' ', '-')
        search_url = f"{self.base_url}/search/{search_query}"
        
        try:
            response = self.session.get(search_url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            items = soup.find_all('div', class_='flw-item')
            
            results = []
            for item in items:
                try:
                    img = item.find('img')
                    cover_url = img.get('data-src') if img else None
                    
                    link_elem = item.find('a', href=re.compile(r'/(tv|movie)/watch-'))
                    if not link_elem:
                        continue
                    
                    href = link_elem.get('href', '')
                    media_id_match = re.search(r'-(\d+)$', href)
                    media_id = media_id_match.group(1) if media_id_match else None
                    media_type = 'tv' if '/tv/' in href else 'movie'
                    
                    title_elem = item.find('h2', class_='film-name')
                    if title_elem:
                        title_link = title_elem.find('a')
                        title = title_link.get('title', '') if title_link else ''
                    else:
                        title = ''
                    
                    results.append({
                        'title': title,
                        'media_id': media_id,
                        'media_type': media_type,
                        'cover_url': cover_url,
                        'href': href
                    })
                except:
                    continue
            
            return results
            
        except Exception as e:
            print(f"Erro: {e}")
            return []

scraper = MovieScraper()

@app.route('/')
def index():
    """Página principal"""
    return render_template('index.html')

@app.route('/api/search', methods=['POST'])
def search():
    """API de busca"""
    data = request.get_json()
    query = data.get('query', '').strip()
    
    if not query:
        return jsonify({'error': 'Query vazia'}), 400
    
    results = scraper.search(query)
    return jsonify({'results': results, 'total': len(results)})

if __name__ == '__main__':
    app.run(debug=True, port=5000)