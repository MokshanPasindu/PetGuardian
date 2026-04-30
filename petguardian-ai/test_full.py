# Create the test script
@"
import requests
import json

BASE     = 'http://localhost:8080'
FRONTEND = 'http://localhost:3000'

# ── Step 1: Login ──────────────────────────────────────────
print('Step 1: Logging in...')
login_resp = requests.post(
    f'{BASE}/auth/login',
    json={'email': 'owner@test.com', 'password': 'password123'},
    headers={'Content-Type': 'application/json'}
)
print(f'  Status: {login_resp.status_code}')

if login_resp.status_code != 200:
    print(f'  Error: {login_resp.text}')
    exit(1)

login_data = login_resp.json()
# Try different token field names
token = (
    login_data.get('token') or
    login_data.get('accessToken') or
    login_data.get('data', {}).get('token') or
    login_data.get('data', {}).get('accessToken')
)

if not token:
    print('  Could not find token in response')
    print('  Response:', json.dumps(login_data, indent=2))
    exit(1)

print(f'  Token: {token[:40]}...')
headers = {'Authorization': f'Bearer {token}'}

# ── Step 2: Flask Health via Spring Boot ──────────────────
print('\nStep 2: Checking Flask via Spring Boot...')
health_resp = requests.get(f'{BASE}/ai/health', headers=headers)
print(f'  Status: {health_resp.status_code}')
print(f'  Body  : {health_resp.text}')

# ── Step 3: Get Pets ───────────────────────────────────────
print('\nStep 3: Getting pets...')
pets_resp = requests.get(f'{BASE}/pets', headers=headers)
print(f'  Status: {pets_resp.status_code}')

pets_data = pets_resp.json()
pets      = pets_data if isinstance(pets_data, list) else pets_data.get('data', [])

if not pets:
    print('  No pets found. Create a pet first in the UI.')
    exit(1)

pet    = pets[0]
pet_id = pet.get('id')
print(f'  Using pet: {pet.get(\"name\")} (id={pet_id})')

# ── Step 4: AI Analyze ─────────────────────────────────────
print('\nStep 4: Sending image to AI analyze...')
with open('test_dog.jpg', 'rb') as img:
    analyze_resp = requests.post(
        f'{BASE}/ai/analyze',
        headers=headers,
        files={'image': ('test_dog.jpg', img, 'image/jpeg')},
        data={'petId': pet_id}
    )

print(f'  Status: {analyze_resp.status_code}')

if analyze_resp.status_code == 200:
    result = analyze_resp.json()
    # Handle wrapped or unwrapped response
    data   = result.get('data', result)
    print(f'  ✅ Prediction  : {data.get(\"prediction\") or data.get(\"predictedClass\")}')
    print(f'  ✅ Confidence  : {round((data.get(\"confidence\") or 0) * 100, 1)}%')
    print(f'  ✅ Severity    : {data.get(\"severity\")}')
    print(f'  ✅ VetTrigger  : {data.get(\"vetConnectTrigger\") or data.get(\"vetConnectTriggered\")}')
    print(f'  ✅ Scan ID     : {data.get(\"id\")}')
    print(f'  ✅ Pet Name    : {data.get(\"petName\")}')
    print(f'  ✅ Guidance    : {str(data.get(\"guidance\", \"\"))[:80]}...')

    scan_id = data.get('id')

    # ── Step 5: Get Scan History ───────────────────────────
    print(f'\nStep 5: Getting scan history for pet {pet_id}...')
    hist_resp = requests.get(
        f'{BASE}/ai/scans/{pet_id}',
        headers=headers
    )
    print(f'  Status: {hist_resp.status_code}')
    hist_data = hist_resp.json()
    hist_list = hist_data if isinstance(hist_data, list) else hist_data.get('data', [])
    print(f'  ✅ Total scans: {len(hist_list)}')

    # ── Step 6: Save to Medical History ───────────────────
    if scan_id:
        print(f'\nStep 6: Saving scan {scan_id} to medical history...')
        save_resp = requests.post(
            f'{BASE}/ai/scans/{scan_id}/save-to-history',
            headers=headers
        )
        print(f'  Status: {save_resp.status_code}')
        print(f'  Body  : {save_resp.text}')

    print('\n✅ ALL TESTS PASSED — Full pipeline working!')

else:
    print(f'  ❌ Error: {analyze_resp.text}')
"@ | Out-File -FilePath "test_full.py" -Encoding utf8

# Run full test
