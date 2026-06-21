"use client"

import React, { useState, useEffect, useRef } from "react"

type ScratchCardProps = {
  brushRadius?: number
  onClick?: () => void
}

function ScratchCard({ brushRadius = 30, onClick }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasScratched, setHasScratched] = useState(false)
  const totalAreaRef = useRef(0)
  const clearedAreaRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resize = () => {
      const rect = container.getBoundingClientRect()
      if (!rect.width || !rect.height) return

      totalAreaRef.current = rect.width * rect.height
      clearedAreaRef.current = 0

      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalCompositeOperation = "source-over"
      ctx.fillStyle = "#d4d4d8"
      ctx.fillRect(0, 0, rect.width, rect.height)
    }

    resize()

    const handleResize = () => {
      resize()
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const scratchAtPoint = (x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.globalCompositeOperation = "destination-out"
    ctx.beginPath()
    ctx.arc(x, y, brushRadius, 0, Math.PI * 2)
    ctx.fill()

    const circleArea = Math.PI * brushRadius * brushRadius
    clearedAreaRef.current += circleArea
  }

  const getPosition = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const handlePointerDown = (
    event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    event.preventDefault()
    setIsDrawing(true)
    setHasScratched(true)

    if ("touches" in event) {
      const touch = event.touches[0]
      if (!touch) return
      const pos = getPosition(touch.clientX, touch.clientY)
      if (pos) scratchAtPoint(pos.x, pos.y)
    } else {
      const pos = getPosition(event.clientX, event.clientY)
      if (pos) scratchAtPoint(pos.x, pos.y)
    }
  }

  const handlePointerMove = (
    event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing) return
    event.preventDefault()

    if ("touches" in event) {
      const touch = event.touches[0]
      if (!touch) return
      const pos = getPosition(touch.clientX, touch.clientY)
      if (pos) scratchAtPoint(pos.x, pos.y)
    } else {
      const pos = getPosition(event.clientX, event.clientY)
      if (pos) scratchAtPoint(pos.x, pos.y)
    }
  }

  const endDrawing = () => {
    setIsDrawing(false)
  }

  const handleClick = () => {
    if (!onClick || !hasScratched) return

    const total = totalAreaRef.current
    if (total <= 0) {
      onClick()
      return
    }

    const progress = Math.min(clearedAreaRef.current / total, 1)
    if (progress >= 1) {
      onClick()
    }
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full touch-none"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={endDrawing}
        onClick={handleClick}
      />
    </div>
  )
}

export default function Home() {
  const [digits, setDigits] = useState<string[]>(Array(7).fill("0"))
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showGift, setShowGift] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [noPosition, setNoPosition] = useState({ top: 65, left: 50 })
  const [invitationNoPosition, setInvitationNoPosition] = useState({
    top: 65,
    left: 50,
  })
  const [invitationYesScale, setInvitationYesScale] = useState(1)
  const [bootstrapped, setBootstrapped] = useState(false)
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    finished: false,
  })
  const imagesScrollRef = useRef<HTMLDivElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isSongPlaying, setIsSongPlaying] = useState(false)
  const [currentSongImage, setCurrentSongImage] = useState("/song1.jpg")
  const [isDesktop, setIsDesktop] = useState(false)

  const getResponsiveImage = (src: string) => {
    if (!isDesktop) return src

    switch (src) {
      case "/lock.jpg":
        return "/lock-desktop.jpg"
      case "/gift.jpg":
        return "/gift-desktop.jpg"
      case "/images1.jpg":
        return "/images1-desktop.jpg"
      case "/images2.jpg":
        return "/images2-desktop.jpg"
      case "/message.jpg":
        return "/message-desktop.jpg"
      case "/invitation.jpg":
        return "/invitation-desktop.jpg"
      case "/invitation-message.jpg":
        return "/invitation-message-desktop.jpg"
      case "/song1.jpg":
        return "/song1-desktop.jpg"
      case "/song2.jpg":
        return "/song2-desktop.jpg"
      default:
        return src
    }
  }

  useEffect(() => {
    const updateIsDesktop = () => {
      if (typeof window === "undefined") return
      setIsDesktop(window.innerWidth >= 768)
    }

    updateIsDesktop()
    window.addEventListener("resize", updateIsDesktop)

    return () => {
      window.removeEventListener("resize", updateIsDesktop)
    }
  }, [])

  useEffect(() => {
    const targetTime = new Date(2026, 5, 27, 0, 0, 0).getTime()

    const updateCountdown = () => {
      const now = Date.now()
      const diff = targetTime - now

      if (diff <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          finished: true,
        })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setCountdown({
        days,
        hours,
        minutes,
        seconds,
        finished: false,
      })
    }

    updateCountdown()
    const intervalId = setInterval(updateCountdown, 1000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (!bootstrapped) return
    if (typeof window === "undefined") return

    const imageSources = [
      "/lock.jpg",
      "/gift.jpg",
      "/images1.jpg",
      "/images2.jpg",
      "/message.jpg",
      "/invitation.jpg",
      "/invitation-message.jpg",
      "/song1.jpg",
      "/song2.jpg",
    ]

    imageSources.forEach((src) => {
      const img = new Image()
      img.src = getResponsiveImage(src)
    })

    const questionImage = new Image()
    questionImage.src = "/question-desktop.jpg"

    const questionVideo = document.createElement("video")
    questionVideo.src = "/question.jpg"
    questionVideo.preload = "auto"
  }, [bootstrapped, isDesktop])

  useEffect(() => {
    try {
      const storedState = sessionStorage.getItem("valentineState")

      if (storedState) {
        const parsed = JSON.parse(storedState) as any

        if (typeof parsed.isUnlocked === "boolean") {
          setIsUnlocked(parsed.isUnlocked)
        } else {
          const stored = sessionStorage.getItem("valentineUnlocked")
          if (stored === "1") {
            setIsUnlocked(true)
          }
        }

        if (typeof parsed.showGift === "boolean") {
          setShowGift(parsed.showGift)
        }

        if (typeof parsed.selectedImage === "string" && parsed.selectedImage) {
          const migratedImage =
            parsed.selectedImage === "/songs.jpg"
              ? "/song1.jpg"
              : parsed.selectedImage
          setSelectedImage(migratedImage)
        }
      } else {
        const stored = sessionStorage.getItem("valentineUnlocked")
        if (stored === "1") {
          setIsUnlocked(true)
        }
      }
    } catch {
      // ignore
    } finally {
      setBootstrapped(true)
    }
  }, [])

  useEffect(() => {
    try {
      const state = {
        isUnlocked,
        showGift,
        selectedImage,
      }
      sessionStorage.setItem("valentineState", JSON.stringify(state))
    } catch {}
  }, [isUnlocked, showGift, selectedImage])

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("valentineUnlocked")
      if (stored === "1") {
        setIsUnlocked(true)
      }
    } catch {}
  }, [])

  const handleDigitChange = (index: number, direction: "up" | "down") => {
    if (isUnlocked) return

    setDigits((prev) => {
      const next = [...prev]
      const current = parseInt(next[index] ?? "0", 10)
      const newDigit =
        direction === "up" ? (current + 1) % 10 : (current + 9) % 10
      next[index] = String(newDigit)
      const enteredCode = next.join("")
      if (enteredCode === "1552025") {
        setIsUnlocked(true)
        try {
          sessionStorage.setItem("valentineUnlocked", "1")
        } catch {}
      }

      return next
    })
  }

  const moveNoButton = () => {
    if (!isUnlocked || showGift) return

    const top = 40 + Math.random() * 40
    const left = 20 + Math.random() * 60
    setNoPosition({ top, left })
  }

  const moveInvitationNoButton = () => {
    if (selectedImage !== "/invitation.jpg") return

    const top = 20 + Math.random() * 60
    const left = 10 + Math.random() * 80
    setInvitationNoPosition({ top, left })
  }

  const handleYesClick = () => {
    if (!isUnlocked) return
    setShowGift(true)
  }

  if (!bootstrapped) {
    return <main className="min-h-screen w-full bg-[#fff9f9]" />
  }

  return (
    <main className="min-h-screen w-full bg-[#fff9f9] relative overflow-hidden">
      {/* Main Content */}
      {!isUnlocked ? (
        <div className="relative w-full h-screen">
          <img
            src={getResponsiveImage("/lock.jpg")}
            alt="Lock"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 transform translate-y-10 sm:translate-y-20">
            <div className="flex gap-2 bg-white/80 px-3 py-2 rounded-3xl shadow-xl max-w-xs">
              {digits.map((value, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-1 bg-white rounded-2xl px-1.5 py-1.5 shadow-md"
                >
                  <button
                    type="button"
                    className="text-xs sm:text-sm text-gray-700 leading-none"
                    onClick={() => handleDigitChange(idx, "up")}
                  >
                    ▲
                  </button>
                  <div className="text-base sm:text-xl font-semibold text-gray-800 min-w-[1.25rem] text-center">
                    {value}
                  </div>
                  <button
                    type="button"
                    className="text-xs sm:text-sm text-gray-700 leading-none"
                    onClick={() => handleDigitChange(idx, "down")}
                  >
                    ▼
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : !showGift ? (
        <div className="relative w-full h-screen">
          {isDesktop ? (
            <img
              src="/question-desktop.jpg"
              alt="Question"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          ) : (
            <img
              src="/question.jpg"
              alt="Question"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          )}
          <button
            type="button"
            onClick={() => {
              setIsUnlocked(false)
              setShowGift(false)
              setDigits(Array(7).fill("0"))
              setNoPosition({ top: 65, left: 50 })
              try {
                sessionStorage.removeItem("valentineUnlocked")
                sessionStorage.removeItem("valentineState")
              } catch {}
            }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 text-[#ff508f] text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase shadow-lg backdrop-blur hover:bg-white hover:shadow-xl transition-all duration-200 z-30"
          >
            <span className="text-base sm:text-lg leading-none">↩</span>
            <span>GO BACK</span>
          </button>
          <div
            className={`absolute inset-0 flex flex-col items-center justify-end ${
              isDesktop ? "pb-22" : "pb-30"
            }`}
          >
            <div className="flex gap-6 justify-center">
              <button
                type="button"
                onClick={handleYesClick}
                className="w-[160px] h-[64px] md:w-[180px] md:h-[72px] flex items-center justify-center rounded-full bg-[#ff508f] hover:bg-[#c8326e] text-white text-xl md:text-2xl font-bold shadow-lg transition-colors"
              >
                Yes
              </button>
              <div className="flex items-center justify-center w-[160px] md:w-[180px]">
                <button
                  type="button"
                  onMouseEnter={moveNoButton}
                  onTouchStart={moveNoButton}
                  onClick={moveNoButton}
                  className="w-[160px] h-[64px] md:w-[180px] md:h-[72px] flex items-center justify-center rounded-full bg-gray-200 text-gray-800 text-xl md:text-2xl font-bold shadow-md transition-transform"
                  style={{
                    position:
                      noPosition.top === 65 && noPosition.left === 50
                        ? "static"
                        : "absolute",
                    top:
                      noPosition.top === 65 && noPosition.left === 50
                        ? "auto"
                        : `${noPosition.top}%`,
                    left:
                      noPosition.top === 65 && noPosition.left === 50
                        ? "auto"
                        : `${noPosition.left}%`,
                    transform:
                      noPosition.top === 65 && noPosition.left === 50
                        ? "none"
                        : "translate(-50%, -50%)",
                  }}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-screen">
          {/* Static image background for before/after video */}
          <img
            src={getResponsiveImage("/gift.jpg")}
            alt="Gift"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {!selectedImage && (
            <button
              type="button"
              onClick={() => {
                setShowGift(false)
                setSelectedImage(null)
                setInvitationNoPosition({ top: 65, left: 50 })
              }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 text-[#ff508f] text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase shadow-lg backdrop-blur hover:bg-white hover:shadow-xl transition-all duration-200 z-30"
            >
              <span className="text-base sm:text-lg leading-none">↩</span>
              <span>GO BACK</span>
            </button>
          )}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {!isDesktop ? (
              <>
                <button
                  type="button"
                  aria-label="Open images"
                  className="absolute pointer-events-auto top-[32%] left-[14%] w-[30%] h-[18%]"
                  onClick={() => setSelectedImage("/images1.jpg")}
                />
                <button
                  type="button"
                  aria-label="Open message"
                  className="absolute pointer-events-auto top-[32%] right-[14%] w-[30%] h-[18%]"
                  onClick={() => setSelectedImage("/message.jpg")}
                />
                <button
                  aria-label="Open songs"
                  className="absolute pointer-events-auto top-[54%] left-[14%] w-[30%] h-[18%]"
                  onClick={() => {
                    setSelectedImage("/song1.jpg")
                    setIsSongPlaying(false)
                    setCurrentSongImage("/song1.jpg")
                  }}
                />
                <button
                  type="button"
                  aria-label="Open invitation"
                  className="absolute pointer-events-auto top-[54%] right-[14%] w-[30%] h-[18%]"
                  onClick={() => {
                    setInvitationNoPosition({ top: 65, left: 50 })
                    setInvitationYesScale(1)
                    setSelectedImage("/invitation.jpg")
                  }}
                />
              </>
            ) : (
              <>
                <button
                  type="button"
                  aria-label="Open images"
                  className="absolute pointer-events-auto top-[52%] left-[7%] w-[17%] h-[28%]"
                  onClick={() => setSelectedImage("/images1.jpg")}
                />
                <button
                  type="button"
                  aria-label="Open message"
                  className="absolute pointer-events-auto top-[52%] left-[29%] w-[17%] h-[28%]"
                  onClick={() => setSelectedImage("/message.jpg")}
                />
                <button
                  aria-label="Open songs"
                  className="absolute pointer-events-auto top-[52%] left-[51%] w-[17%] h-[28%]"
                  onClick={() => {
                    setSelectedImage("/song1.jpg")
                    setIsSongPlaying(false)
                    setCurrentSongImage("/song1.jpg")
                  }}
                />
                <button
                  type="button"
                  aria-label="Open invitation"
                  className="absolute pointer-events-auto top-[52%] left-[73%] w-[17%] h-[28%]"
                  onClick={() => {
                    setInvitationNoPosition({ top: 65, left: 50 })
                    setInvitationYesScale(1)
                    setSelectedImage("/invitation.jpg")
                  }}
                />
              </>
            )}
          </div>

          {selectedImage && (
            <div className="absolute inset-0 z-20 bg-black/90 flex items-center justify-center">
              {selectedImage === "/images1.jpg" ? (
                <div
                  ref={imagesScrollRef}
                  className="relative w-full h-full overflow-y-auto"
                >
                  <img
                    src={getResponsiveImage("/images1.jpg")}
                    alt="Images part 1"
                    className="w-full h-auto block"
                  />
                  <img
                    src={getResponsiveImage("/images2.jpg")}
                    alt="Images part 2"
                    className="w-full h-auto block"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const container = imagesScrollRef.current
                      if (!container) return
                      container.scrollTo({
                        top: container.scrollHeight,
                        behavior: "smooth",
                      })
                    }}
                    className="absolute left-1/2 bottom-17 -translate-x-1/2 px-4 py-2 rounded-full bg-white/80 text-[#ff508f] text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase shadow-lg animate-bounce"
                  >
                    <span>SCROLL DOWN</span>
                    <span className="text-lg leading-none">↓</span>
                  </button>
                </div>
              ) : selectedImage === "/song1.jpg" ? (
                <div className="relative w-full h-full">
                  <img
                    src={getResponsiveImage(currentSongImage)}
                    alt="Song artwork"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute"
                    style={
                      isDesktop
                        ? {
                            top: "26%",
                            left: "29.5%",
                            width: "39%",
                            height: "50%",
                          }
                        : {
                            top: "35%",
                            left: "5%",
                            width: "90%",
                            height: "26%",
                          }
                    }
                  >
                    <ScratchCard
                      brushRadius={32}
                      onClick={() => {
                        const audio = audioRef.current
                        if (!audio) return

                        if (isSongPlaying) {
                          audio.pause()
                          audio.currentTime = 0
                          setIsSongPlaying(false)
                          setCurrentSongImage("/song1.jpg")
                        } else {
                          audio
                            .play()
                            .then(() => {
                              setIsSongPlaying(true)
                              setCurrentSongImage("/song2.jpg")
                            })
                            .catch(() => {
                              // ignore play errors (e.g. autoplay restrictions)
                            })
                        }
                      }}
                    />
                  </div>
                  <audio
                    ref={audioRef}
                    src="/song.mp3"
                    className="hidden"
                    onEnded={() => {
                      setIsSongPlaying(false)
                      setCurrentSongImage("/song1.jpg")
                    }}
                  />
                </div>
              ) : (
                <img
                  src={getResponsiveImage(selectedImage || "")}
                  alt="Gift detail"
                  className="w-full h-full object-cover"
                />
              )}
              {selectedImage === "/invitation.jpg" && (
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 md:pb-16">
                  <div className="flex gap-6 justify-center">
                    <button
                      type="button"
                      onClick={() => setSelectedImage("/invitation-message.jpg")}
                      className="w-[160px] h-[64px] md:w-[180px] md:h-[72px] flex items-center justify-center rounded-full bg-[#ff508f] hover:bg-[#c8326e] text-white text-xl md:text-2xl font-bold shadow-lg transition-colors"
                      style={{
                        transform: `scale(${invitationYesScale})`,
                        transition: "transform 0.2s ease-out",
                      }}
                    >
                      Yes
                    </button>
                    <div className="flex items-center justify-center w-[160px] md:w-[180px]">
                      <div
                        onClick={() =>
                          setInvitationYesScale((prev) =>
                            prev < 2.5 ? prev + 0.2 : prev,
                          )
                        }
                        className="w-[160px] h-[64px] md:w-[180px] md:h-[72px] flex items-center justify-center rounded-full bg-gray-200 text-gray-800 text-xl md:text-2xl font-bold shadow-md cursor-pointer"
                        style={{
                          position:
                            invitationNoPosition.top === 65 &&
                            invitationNoPosition.left === 50
                              ? "static"
                              : "absolute",
                          top:
                            invitationNoPosition.top === 65 &&
                            invitationNoPosition.left === 50
                              ? "auto"
                              : `${invitationNoPosition.top}%`,
                          left:
                            invitationNoPosition.top === 65 &&
                            invitationNoPosition.left === 50
                              ? "auto"
                              : `${invitationNoPosition.left}%`,
                          transform:
                            invitationNoPosition.top === 65 &&
                            invitationNoPosition.left === 50
                              ? "none"
                              : "translate(-50%, -50%)",
                        }}
                      >
                        No
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {selectedImage === "/invitation-message.jpg" && (
                <div className="absolute bottom-16 md:bottom-14 left-[43%] md:left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 px-4">
                  {countdown.finished ? (
                    <div className="px-4 py-2 rounded-full bg-[#ff508f] text-white text-sm sm:text-base shadow-lg">
                      It's time! See you at our special day.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-19 sm:gap-6">
                      {["DAYS", "HOURS", "MINUTES", "SECONDS"].map((label) => {
                        const value =
                          label === "DAYS"
                            ? countdown.days
                            : label === "HOURS"
                              ? countdown.hours
                              : label === "MINUTES"
                                ? countdown.minutes
                                : countdown.seconds

                        const display =
                          label === "DAYS"
                            ? String(value)
                            : String(value).padStart(2, "0")

                        return (
                          <div
                            key={label}
                            className="flex flex-col items-center justify-center rounded-2xl bg-white/95 px-3 py-2 sm:px-4 sm:py-3 shadow-lg min-w-[64px] sm:min-w-[80px]"
                          >
                            <div className="text-xl sm:text-3xl font-bold text-[#ff508f]">
                              {display}
                            </div>
                            <div className="mt-1 text-[10px] sm:text-xs tracking-[0.2em] text-gray-700">
                              {label}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  if (selectedImage === "/song1.jpg") {
                    const audio = audioRef.current
                    if (audio) {
                      audio.pause()
                      audio.currentTime = 0
                    }
                    setIsSongPlaying(false)
                    setCurrentSongImage("/song1.jpg")
                  }
                  setSelectedImage(null)
                  setInvitationNoPosition({ top: 65, left: 50 })
                }}
                className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 text-[#ff508f] text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase shadow-lg backdrop-blur hover:bg-white hover:shadow-xl transition-all duration-200 z-30 ${
                  selectedImage === "/invitation-message.jpg" ? "bottom-3" : "bottom-6"
                }`}
              >
                <span className="text-base sm:text-lg leading-none">↩</span>
                <span>GO BACK</span>
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  )
}