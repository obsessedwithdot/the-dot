# THE DOT v13

THE DOT is a public story platform. Posts and public discussions are now stored on the Node server so visitors share the same feed and chats.

## Deploy on Render
- Root Directory: `the-dot` (because the repository contains the app in the nested `the-dot` folder)
- Build Command: `npm install`
- Start Command: `npm start`
- Set `DOT_ADMIN_CODE` to a strong private admin code.
- `TRUST_PROXY=1` is configured in `render.yaml` for Render's proxy.

## Shared data
- `GET/POST /api/posts` stores and returns public posts.
- `GET/POST /api/chats` stores public discussions.
- Admin deletion uses the authenticated `/api/admin/posts/:id` endpoint.
- A small JSON store is used in `data/` so no extra database account is required.

### Important Render Free limitation
The JSON files live on the service filesystem. On hosting plans with an ephemeral filesystem, data can be lost after certain restarts/redeployments. The shared feed works for all visitors while the same server data is available. For a long-term public community, move posts/chats to a managed persistent database.

## Local
```bash
npm install
npm start
```
Then open `http://localhost:8080`.
