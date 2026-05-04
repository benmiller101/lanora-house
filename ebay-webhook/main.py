"""
eBay Marketplace Account Deletion / Closure Notification Webhook Service

This FastAPI service handles eBay's marketplace account deletion notifications.
It exposes two endpoints:

  GET  /ebay/deletion - Challenge verification (eBay verifies your endpoint)
  POST /ebay/deletion - Receives deletion/closure notifications from eBay

How to run:
  cd ebay-webhook
  uvicorn main:app --host 0.0.0.0 --port 8000

Environment variables required:
  EBAY_VERIFICATION_TOKEN - Your verification token from eBay Developer Portal
  EBAY_ENDPOINT_URL       - The full public URL of your POST endpoint
                            (e.g. https://yourdomain.com/ebay/deletion)
"""

import hashlib
import logging
import os

from fastapi import FastAPI, Query, Request
from fastapi.responses import JSONResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ebay-webhook")

app = FastAPI(
    title="eBay Account Deletion Webhook",
    description="Handles eBay Marketplace Account Deletion/Closure notifications",
)


@app.get("/ebay/deletion")
async def ebay_challenge_verification(challenge_code: str = Query(...)):
    """
    eBay Challenge Verification Endpoint

    When eBay registers your notification endpoint, it sends a GET request
    with a `challenge_code` query parameter. You must respond with a JSON
    object containing a `challengeResponse` field whose value is the SHA-256
    hash of:

        challengeCode + verificationToken + endpointUrl

    The hash must be returned as a lowercase hexadecimal string.

    This proves to eBay that you own the endpoint and know the shared
    verification token.
    """
    verification_token = os.environ.get("EBAY_VERIFICATION_TOKEN", "")
    endpoint_url = os.environ.get("EBAY_ENDPOINT_URL", "")

    if not verification_token or not endpoint_url:
        logger.error(
            "Missing EBAY_VERIFICATION_TOKEN or EBAY_ENDPOINT_URL environment variables"
        )
        return JSONResponse(
            status_code=500,
            content={"error": "Server misconfigured – missing environment variables"},
        )

    # SHA-256 of challengeCode + verificationToken + endpointUrl
    hash_input = challenge_code + verification_token + endpoint_url
    challenge_response = hashlib.sha256(hash_input.encode("utf-8")).hexdigest()

    logger.info("Challenge verification successful")
    return JSONResponse(
        status_code=200,
        content={"challengeResponse": challenge_response},
    )


@app.post("/ebay/deletion")
async def ebay_deletion_notification(request: Request):
    """
    eBay Account Deletion / Closure Notification Endpoint

    eBay sends a POST request with a JSON payload whenever a marketplace
    user requests account deletion or closure. The payload contains
    details about the user and the type of notification.

    We log the payload and return HTTP 200 to acknowledge receipt.
    """
    payload = await request.json()
    logger.info("Received eBay deletion notification: %s", payload)
    return JSONResponse(status_code=200, content={"status": "ok"})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
