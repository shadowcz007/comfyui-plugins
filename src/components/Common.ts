export const getPosition = (key: string) => {
  return JSON.parse(
    localStorage.getItem(key) ||
      JSON.stringify({
        x: 0,
        y: 0
      })
  )
}

export const onCardFocus = (key: string) => {
  let cards = document.querySelectorAll('.react-draggable')
  Array.from(cards, (c: any) => {
    // console.log(c.classList, key, c.style.zIndex)
    c.style.zIndex = c.classList.contains(key) ? 99 : 1
  })
}

export const savePosition = (key: string, e: any) => {
  const { x, y } = e.target.getBoundingClientRect()
  localStorage.setItem(
    key,
    JSON.stringify({
      x,
      y
    })
  )

  onCardFocus(key)
}
