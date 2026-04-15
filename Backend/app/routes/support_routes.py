from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.db import get_db
from app.services.support_service import SupportService

router = APIRouter()

# Schemas
class SupportContactRequest(BaseModel):
    application_id: str
    phone: str
    message: str


class SupportContactResponse(BaseModel):
    success: bool
    message: str
    ticket_id: str


class SupportTicketDetail(BaseModel):
    ticket_id: str
    status: str
    phone: str
    message: str
    created_at: str
    
    class Config:
        from_attributes = True


# Endpoints
@router.post("/contact", response_model=SupportContactResponse)
async def submit_support_contact(
    request: SupportContactRequest,
    session: AsyncSession = Depends(get_db)
):
    """
    Submit a support/contact request
    
    - **application_id**: Reference to the application (optional but recommended)
    - **phone**: User's phone number
    - **message**: Support request message
    
    Returns ticket_id for tracking
    """
    try:
        result = await SupportService.create_support_ticket(
            session=session,
            application_id=request.application_id,
            phone=request.phone,
            message=request.message
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ticket/{ticket_id}", response_model=dict)
async def get_ticket(
    ticket_id: str,
    session: AsyncSession = Depends(get_db)
):
    """Get support ticket details by ticket ID"""
    ticket = await SupportService.get_ticket_by_id(session, ticket_id)
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    return {
        "ticket_id": ticket.ticket_id,
        "status": ticket.status,
        "phone": ticket.phone,
        "message": ticket.message,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None
    }


@router.get("/tickets/{phone}")
async def get_user_tickets(
    phone: str,
    session: AsyncSession = Depends(get_db)
):
    """Get all support tickets for a phone number"""
    tickets = await SupportService.get_tickets_by_phone(session, phone)
    
    return {
        "phone": phone,
        "count": len(tickets),
        "tickets": [
            {
                "ticket_id": t.ticket_id,
                "status": t.status,
                "message": t.message,
                "created_at": t.created_at.isoformat() if t.created_at else None
            }
            for t in tickets
        ]
    }
