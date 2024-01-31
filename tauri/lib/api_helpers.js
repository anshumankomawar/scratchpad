import { getCookie } from 'cookies-next';
import { clearCookies } from './utils';
import { NextResponse } from 'next/server'

export async function authorizedFetch(func) {
    const res = await func()
    console.log(res)
    if (res.status == 401) {
        clearCookies()
        return
    }
    return await res.json()
}

export async function getUser() {
    const headers = { 'Authorization': `Bearer ${getCookie("token")}` }
    const req = await fetch('http://localhost:8000/user', {
      method: 'GET',
    //   headers: headers,
      cache: 'no-store'
    })
    return req
}
