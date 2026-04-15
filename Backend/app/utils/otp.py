otp_store = {}

def send_otp(phone):
    otp = "123456"
    otp_store[phone] = otp
    return otp

def verify_otp(phone, otp):
    return otp_store.get(phone) == otp