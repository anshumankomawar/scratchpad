import { clsx } from "clsx"
import { deleteCookie, getCookie } from "cookies-next"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getAuthCookie() {
  try {
    return getCookie("token")
  } catch (error) {
    console.log(error)
    deleteCookie("token")
  }
}

export function clearCookies() {
  const cookies = ["token"]
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    deleteCookie(cookie)
  }
}