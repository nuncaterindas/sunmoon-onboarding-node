# sunmoon-onboarding-node
​
## Running it
​
### With Docker
```bash
- docker-compose up --build
```
### Test
```bash
- npm run test
```
​

### Using it
```bash
- access via localhost:3000
```


#### 1. Create User

```
HTTP Method: POST
URL: /api/users
```

##### Request Body

- `email`\<string> - user's email
- `password`\<string> - user's password
- `name?`\<string> - user's name

```json
{
  "email": "input@email.com",
  "password": "password1"
}
```

##### Sample Response

```json
{
  "id": "e18faf18-8db0-4926-8fde-5ade9a22f254",
  "email": "input@email.com",
  "name": null
}
```

#### 2. Authenticate User

```
HTTP Method: POST
URL: /api/auth
Headers:
  - Authorization: "Basic {encodedusername:password}"
```

##### Sample Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZWQyZTM2Yy1mOWQ3LTRmNGMtYWVjNi0yNTY5YzhmMzFhNDMiLCJleHAiOjE1NzI0OTMzMzgsImlhdCI6MTU2OTkwMTMzOH0.a7_XGpPJfSS8OT5EGxmrhl3_bzOtx33TOZwQw3MHI8U"
}
```

#### 3. Retrieve Single User

```
HTTP Method: GET
URL: /api/users/:id
Headers:
  - Authorization: "Bearer {token}"
```

##### Arguments

- `:id` - user's id

##### Sample Response

```json
{
  "id": "e18faf18-8db0-4926-8fde-5ade9a22f254",
  "email": "input@email.com",
  "name": null
}
```

#### 4. Retrieve All Users

```
HTTP Method: GET
URL: /api/users
Headers:
  - Authorization: "Bearer {token}"
```

##### Sample Response

```json
[
  {
    "id": "e18faf18-8db0-4926-8fde-5ade9a22f254",
    "email": "input@email.com",
    "name": null
  }
]
```

#### 5. Update Own Information

```
HTTP Method: PATCH
URL: /api/users
Headers:
  - Authorization: "Bearer {token}"
```

##### Request Body

- `name` - user's new name
- `password` - user's new password

```json
{
  "name": "new name",
  "password": "newpassword"
}
```

##### Sample Response

```json
{
  "id": "e18faf18-8db0-4926-8fde-5ade9a22f254",
  "email": "input@email.com",
  "name": "new name"
}
```
