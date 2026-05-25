#!/usr/bin/env -S deno run -A

import {DOMParser} from '@b-fuze/deno-dom'
import {writeFile} from 'node:fs/promises'
import {parseArgs} from 'node:util'

async function fetchLoginChallenge() {
  const response = await fetch('https://rutracker.org/forum/login.php')

  const arrayBuffer = await response.bytes()
  const decoder = new TextDecoder('windows-1251')
  const html = decoder.decode(arrayBuffer)

  const doc = new DOMParser().parseFromString(html, 'text/html')

  const form = doc.querySelector('#login-form-full')
  if (!form) {
    throw new Error('Failed to parse RuTracker login form')
  }

  // 3. Извлекаем данные формы с помощью стандартных CSS-селекторов
  const captchaImgEl = form.querySelector('img[src*="/captcha/"]')
  const captchaImage = captchaImgEl ? captchaImgEl.getAttribute('src') : null

  const capSidEl = form.querySelector('input[name="cap_sid"]')
  const capSid = capSidEl ? capSidEl.getAttribute('value') : null

  const captchaFieldEl = form.querySelector('input[name^="cap_code_"]')
  const captchaField = captchaFieldEl ? captchaFieldEl.getAttribute('name') : null

  const redirectEl = form.querySelector('input[name="redirect"]')
  const redirect = (redirectEl ? redirectEl.getAttribute('value') : null) || 'index.php'

  // Если капча не требуется
  if (!captchaImage || !capSid || !captchaField) {
    return {
      redirect,
      requiresCaptcha: false,
    }
  }

  // 4. Скачиваем картинку капчи
  const imageUrl = new URL(captchaImage, 'https://rutracker.org').toString()
  const imageResponse = await fetch(imageUrl)
  const imageBuffer = await imageResponse.bytes()

  // 5. Записываем файл на диск без старого модуля fs
  await writeFile('captcha.jpg', imageBuffer)

  return {
    capSid,
    captchaField,
    redirect,
    requiresCaptcha: true,
  }
}

async function submitLogin({
  username,
  password,
  captcha,
  capSid,
  captchaField,
  redirect,
  requiresCaptcha,
}: {
  username: string
  password: string
  captcha: string
  capSid: string
  captchaField: string
  redirect: string
  requiresCaptcha: boolean
}) {
  const body = new URLSearchParams()

  body.append('redirect', redirect)
  body.append('login_username', username)
  body.append('login_password', password)
  if (requiresCaptcha) {
    body.append('cap_sid', capSid)
    body.append(captchaField, captcha)
  }
  body.append('login', 'Вход')

  // 1. Отправляем POST-запрос через fetch
  const response = await fetch('https://rutracker.org/forum/login.php', {
    method: 'POST',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    body: body,
    // Запрещаем автоматический редирект, чтобы вручную поймать статус 302
    redirect: 'manual',
  })

  // 2. Извлекаем куки из заголовков ответа
  const setCookieHeaders = response.headers.getSetCookie()

  const sessionCookie = setCookieHeaders
    .find((cookie) => cookie.startsWith('bb_session='))

  // fetch при redirect: "manual" возвращает тип "opaqueredirect" и статус 0 или 302
  if ((response.status === 302 || response.type === 'opaqueredirect') && sessionCookie) {
    return sessionCookie
  }

  // 3. Если редиректа не произошло (ошибка авторизации) — парсим страницу ответа
  const arrayBuffer = await response.arrayBuffer()
  const decoder = new TextDecoder('windows-1251')
  const responseBody = decoder.decode(arrayBuffer)

  // Инициализируем стандартный DOMParser
  const parser = new DOMParser()
  const doc = parser.parseFromString(responseBody, 'text/html')

  // Ищем блок с текстом ошибки
  const errorEl = doc.querySelector('.mrg_16')
  const errorText = errorEl
    ? errorEl.textContent.replace(/\s+/g, ' ').trim()
    : ''

  if (errorText) {
    throw new Error(`Login failed: ${errorText}`)
  }

  throw new Error('Login failed: invalid username, password, or CAPTCHA')
}

if (import.meta.main) {
  const {values} = parseArgs({
    options: {
      user: {type: 'string', short: 'u'},
      pass: {type: 'string', short: 'p'},
    },
  })
  if (!values.user || !values.pass) {
    throw new Error('login requires --user and --pass')
  }

  const challenge = await fetchLoginChallenge()
  console.log({challenge})
  const captcha = challenge.requiresCaptcha ? prompt('Captcha') : null

  if (challenge.requiresCaptcha && !captcha) {
    throw new Error('login requires CAPTCHA code')
  }

  const cookie = await submitLogin({
    username: values.user,
    password: values.pass,
    captcha: captcha!,
    capSid: challenge.capSid!,
    captchaField: challenge.captchaField!,
    redirect: challenge.redirect,
    requiresCaptcha: challenge.requiresCaptcha,
  })
  console.log({cookie})

  await writeFile('session.json', JSON.stringify({cookie, createdAt: new Date()}, null, 2))
}
