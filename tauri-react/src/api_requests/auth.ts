import axios from 'axios'

export type LoginType = {
  access_token: string
  token_type: string
}

export class LoginNotFoundError extends Error {}

export const fetchAuth = async (username: string, password: string) => {
  console.log('fetching', username, password)
  await new Promise((r) => setTimeout(r, 500))
  const login = await axios
    .post<LoginType>("http://127.0.0.1:8000/login", {
        "username": username,
        "password": password
    })
    .then((r) => r.data)
    .catch((err) => {
      if (err.response.status === 404) {
        throw new LoginNotFoundError(`Post with id not found!`)
      }
      throw err
    })

  return login
}