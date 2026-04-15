import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select

from app.models.support_ticket import SupportTicket

class SupportService:
    
    @staticmethod
    async def create_support_ticket(
        session: AsyncSession,
        application_id: str,
        phone: str,
        message: str
    ) -> dict:
        """
        Create a new support ticket
        
        Args:
            session: Database session
            application_id: Application reference
            phone: User phone number
            message: Support message
            
        Returns:
            dict with success status and ticket_id
        """
        # Generate unique ticket ID (format: TICKET_[short-uuid])
        ticket_id = f"TICKET_{str(uuid.uuid4())[:8].upper()}"
        
        # Create ticket
        ticket = SupportTicket(
            ticket_id=ticket_id,
            application_id=application_id,
            phone=phone,
            message=message,
            status="open"
        )
        
        session.add(ticket)
        await session.commit()
        await session.refresh(ticket)
        
        return {
            "success": True,
            "message": "Your support request has been submitted successfully",
            "ticket_id": ticket_id
        }
    
    @staticmethod
    async def get_ticket_by_id(session: AsyncSession, ticket_id: str) -> SupportTicket:
        """Get support ticket by ticket ID"""
        result = await session.execute(
            select(SupportTicket).where(SupportTicket.ticket_id == ticket_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_tickets_by_phone(session: AsyncSession, phone: str) -> list:
        """Get all support tickets for a phone number"""
        result = await session.execute(
            select(SupportTicket)
            .where(SupportTicket.phone == phone)
            .order_by(SupportTicket.created_at.desc())
        )
        return result.scalars().all()
