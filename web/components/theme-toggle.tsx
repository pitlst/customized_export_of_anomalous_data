"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="h-7 w-7" />
    }

    const isDark = resolvedTheme === "dark"

    return (
        <Button variant="ghost" size="icon" onClick={() => setTheme(isDark ? "light" : "dark")} aria-label={isDark ? "切换到亮色模式" : "切换到暗色模式"}>
            {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </Button>
    )
}
