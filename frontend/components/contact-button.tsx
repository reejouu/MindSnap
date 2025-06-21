"use client"

import { useState } from "react"
import { Github, Twitter, Mail } from "lucide-react"

export default function ContactButton() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      className="relative flex overflow-hidden cursor-pointer w-[150px] h-[50px] bg-[#eeeeed] rounded-[80px] border-none px-[80px] transition-all duration-200 ease-in-out justify-center items-center hover:scale-110"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className={`absolute z-[99] w-[150px] h-[50px] rounded-[80px] font-mono font-semibold text-[17px] text-center leading-[50px] tracking-[2px] text-[#eeeeed] bg-[#1f1f1f] px-[10px] transition-all duration-[1200ms] ease-in-out ${
          isHovered ? "opacity-0" : "opacity-100"
        }`}
      >
        Contact Me
      </span>
      <div className="flex w-[150px] rounded-[80px] leading-[50px]">
        <Twitter
          className={`w-[35px] h-[35px] px-[5px] transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: isHovered ? "0.65s" : "0s" }}
        />
        <Mail
          className={`w-[35px] h-[35px] px-[5px] transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: isHovered ? "0.8s" : "0s" }}
        />
        <Github
          className={`w-[35px] h-[35px] px-[5px] transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: isHovered ? "0.5s" : "0s" }}
        />
      </div>
    </button>
  )
}
