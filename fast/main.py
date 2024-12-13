from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import uvicorn
import re
import io
import logging

app = FastAPI()

# Enable logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  
        "http://localhost:5173",  
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def parse_ros_log(log_content: str):
    logs = []
   
    log_pattern = re.compile(r'\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] \[(\w+)\] \[(.+?)\] (.+)')
    for line in log_content.split('\n'):
        line = line.strip()
        if line: 
            match = log_pattern.match(line)
            if match:
                timestamp, severity, node_name, message = match.groups()
                logs.append({
                    'timestamp': timestamp,
                    'severity': severity,
                    'node_name': node_name,
                    'message': message
                })
    return logs

@app.post("/upload-log")
async def upload_log_file(file: UploadFile = File(...)):
    logger.info(f"Uploading file: {file.filename}")
    try:
        content = await file.read()
        log_content = content.decode('utf-8')
        parsed_logs = parse_ros_log(log_content)
        logger.info(f"Parsed {len(parsed_logs)} logs from file: {file.filename}")
        return {
            "filename": file.filename,
            "total_logs": len(parsed_logs),
            "logs": parsed_logs
        }
    except Exception as e:
        logger.error(f"Error processing file {file.filename}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/filter-logs")
async def filter_logs(filter_request: dict):
    logs = filter_request.get('logs', [])
    severity_levels = filter_request.get('severity_levels', [])
    search_term = filter_request.get('search_term', '').lower()

    if severity_levels:
        logs = [log for log in logs if log['severity'] in severity_levels]

    if search_term:
        logs = [log for log in logs if search_term in log['message'].lower() or search_term in log['node_name'].lower()]

    return {"filtered_logs": logs}

@app.post("/download-logs")
async def download_logs(log_request: dict):
    logs = log_request.get('logs', [])
    if not logs:
        raise HTTPException(status_code=400, detail="No logs to download.")

    log_content = "\n".join([f"[{log['severity']}] [{log['timestamp']}] [{log['node_name']}]: {log['message']}" for log in logs])
    log_bytes = log_content.encode('utf-8')

    return StreamingResponse(
        iter([log_bytes]),
        media_type="text/plain",
        headers={"Content-Disposition": "attachment; filename=filtered_ros_logs.txt"}
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
