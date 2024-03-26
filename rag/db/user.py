def get_user(email: str, db: dict):
    user = db["client"].from_("users").select("*").eq("email", email).execute()
    if user.data != []:
        return user.data[0]
    else:
        return None
