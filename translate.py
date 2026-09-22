import urllib.request
import json

env = open('.env', 'r', encoding='utf-8').read()
api_key = env.split('OPENAI_API_KEY="')[1].split('"')[0]

de_content = open('prisma/_de-m1-content.mjs', 'r', encoding='utf-8').read()

data = {
    "model": "gpt-4o",
    "messages": [
        {
            "role": "system",
            "content": "You are a translator. Translate the German strings in this JS file into Turkish. Keep the structure, variable names, and Tajik translations exactly the same. Only change the German text to Turkish (e.g. Hallo -> Merhaba, Guten Morgen -> Günaydın, etc.). The file defines words, grammar examples, dialogue lines, and comprehension passages. Keep the Tajik parts untouched. For example { word: 'Hallo', translation: 'Салом' } -> { word: 'Merhaba', translation: 'Салом' }."
        },
        {
            "role": "user",
            "content": de_content
        }
    ]
}

req = urllib.request.Request(
    'https://api.openai.com/v1/chat/completions',
    data=json.dumps(data).encode('utf-8'),
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
)

print("Sending request to OpenAI...")
res = urllib.request.urlopen(req)
response_data = json.loads(res.read().decode('utf-8'))
out = response_data['choices'][0]['message']['content']

out = out.replace('```javascript\n', '').replace('```js\n', '').replace('\n```', '')

with open('prisma/_tr-m1-content.mjs', 'w', encoding='utf-8') as f:
    f.write(out)

print("Done translating!")
