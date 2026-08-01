import csv
import json
import os
import ssl
import time
import urllib.parse
import urllib.request

# =========================================================
# PASTE YOUR FREE GOOGLE BOOKS API KEY HERE:
API_KEY = 'AIzaSyAOmFp6XRqxIDDiBJE3F6IyUtxSXf9ekjo'
# =========================================================

input_filename = 'All book volumes.csv'
output_filename = 'All_book_volumes_with_ISBN.csv'

ssl_context = ssl._create_unverified_context()


def fetch_google_books_isbn(title, author):
  """Look up ISBN-13 and cover image URL using Google Books API with Key."""
  title_clean = title.strip() if title else ''
  author_clean = (
      author.strip()
      if author and str(author).lower() != 'nan'
      else ''
  )

  # Construct search query
  if author_clean:
    query = f'intitle:"{title_clean}" inauthor:"{author_clean}"'
  else:
    query = f'intitle:"{title_clean}"'

  encoded_query = urllib.parse.quote(query)
  url = f'https://www.googleapis.com/books/v1/volumes?q={encoded_query}&key={API_KEY}'

  req = urllib.request.Request(
      url,
      headers={
          'User-Agent': (
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
              ' AppleWebKit/537.36'
          )
      },
  )

  try:
    with urllib.request.urlopen(
        req, context=ssl_context, timeout=10
    ) as response:
      data = json.loads(response.read().decode('utf-8'))
      items = data.get('items', [])

      # Fallback to broader query if exact match yields 0 items
      if not items:
        broad_query = urllib.parse.quote(f'{title_clean} {author_clean}'.strip())
        broad_url = f'https://www.googleapis.com/books/v1/volumes?q={broad_query}&key={API_KEY}'
        broad_req = urllib.request.Request(
            broad_url, headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(
            broad_req, context=ssl_context, timeout=10
        ) as resp_broad:
          data = json.loads(resp_broad.read().decode('utf-8'))
          items = data.get('items', [])

      if items:
        # Search through results for the best matching ISBN
        for item in items:
          info = item.get('volumeInfo', {})
          identifiers = info.get('industryIdentifiers', [])

          isbn13 = ''
          isbn10 = ''
          for ident in identifiers:
            if ident.get('type') == 'ISBN_13':
              isbn13 = ident.get('identifier')
            elif ident.get('type') == 'ISBN_10':
              isbn10 = ident.get('identifier')

          chosen_isbn = isbn13 if isbn13 else isbn10

          if chosen_isbn:
            images = info.get('imageLinks', {})
            cover = (
                images.get('thumbnail')
                or images.get('smallThumbnail')
                or ''
            )
            return chosen_isbn, cover

  except Exception as e:
    print(f'  [API Exception]: {e}')

  return '', ''


# Load previous progress if file exists
source_file = (
    output_filename if os.path.exists(output_filename) else input_filename
)
print(f'Loading data from "{source_file}"...\n')

with open(source_file, mode='r', encoding='utf-8') as infile:
  reader = csv.DictReader(infile)
  fieldnames = [fn for fn in reader.fieldnames if fn]
  if 'ISBN' not in fieldnames:
    fieldnames.append('ISBN')
  if 'cover_url' not in fieldnames:
    fieldnames.append('cover_url')
  rows = list(reader)

total = len(rows)

for idx, row in enumerate(rows, start=1):
  title = row.get('Title', '')
  author = row.get('Author', '')

  # Skip entries that already have an ISBN saved
  if row.get('ISBN') and str(row.get('ISBN')).strip() != '':
    print(f'[{idx}/{total}] Skipping (Already Saved): {title}')
    continue

  isbn, cover = fetch_google_books_isbn(title, author)

  row['ISBN'] = isbn
  if cover and not row.get('cover_url'):
    row['cover_url'] = cover

  status = f'ISBN: {isbn}' if isbn else 'NOT FOUND'
  print(f'[{idx}/{total}] {title} -> {status}')

  # Save updated CSV after every item
  with open(
      output_filename, mode='w', encoding='utf-8', newline=''
  ) as outfile:
    writer = csv.DictWriter(
        outfile, fieldnames=fieldnames, extrasaction='ignore'
    )
    writer.writeheader()
    writer.writerows(rows)

  # Pacing delay (0.2s is plenty with an API key)
  time.sleep(0.2)

print(f'\nFinished! Final results saved in "{output_filename}".')