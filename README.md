
# DVLA Proxy for Re-Boot Automotive

### Overview
This is a lightweight Express proxy to keep your DVLA API key private. It receives requests like:
```
GET /api/vehicle?reg=AB12CDE
```
and returns a simplified JSON response with make, model, colour, and year.

### Deployment (Render)
1. Go to [Render.com](https://render.com) → New → Web Service.
2. Connect this folder (GitHub repo or manual upload).
3. Set environment variable:
   ```
   DVLA_KEY=your_real_dvla_api_key_here
   ```
4. Deploy. It will be available at:
   ```
   https://your-app-name.onrender.com/api/vehicle?reg=AB12CDE
   ```

### Example Response
```json
{
  "reg": "AB12CDE",
  "make": "FORD",
  "model": "FOCUS",
  "colour": "BLUE",
  "year": 2019
}
```

### Notes
- Ensure `DVLA_KEY` is valid and has access to the UK DVLA vehicle-enquiry API.
- CORS is enabled by default.
