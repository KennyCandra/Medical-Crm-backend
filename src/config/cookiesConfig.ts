export const cookiesConfig = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 60 * 1000,
}

export const removedCookiesConfig = {
    secure: true,
    sameSite: "none",
    httpOnly: true,
    path: "/",
    maxAge: 0,
}