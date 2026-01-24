import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import os




def send_otp(email, otp):
    """Send OTP to the specified email address."""
    
    smtp_server = 'smtp.gmail.com'
    smtp_port = 587
    smtp_username = 'shubhanshsharma030604@gmail.com'
    smtp_password = os.getenv('SMTP_PASSWORD')
    
    try:
        smtp_conn = smtplib.SMTP(smtp_server, smtp_port)
        smtp_conn.starttls()
        smtp_conn.login(smtp_username, smtp_password)
        
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = email
        msg['Subject'] = 'HITL LoRA - OTP'
        
        body = f"Your OTP is: {otp}\n\nYour OTP will expire in 5 minutes. Please do not share this OTP with anyone."
        msg.attach(MIMEText(body, 'plain'))
        
        smtp_conn.sendmail(smtp_username, [email], msg.as_string())
        smtp_conn.quit()
        
        print(f'OTP sent to: {email}')
        return True
    except Exception as e:
        print(f'Failed to send OTP: {str(e)}')
        return False
