'use client';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuContent, DropdownMenuRadioItem, DropdownMenuRadioGroup } from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon, SunMoon } from "lucide-react";

const MoodToggle = () => {
    const [mounted, setMounted] = useState(false);
    const {setTheme, resolvedTheme } = useTheme();
    const [currentTheme, setCurrentTheme] = useState('system');

    useEffect(() => {
        setMounted(true);
        if (resolvedTheme) {
            setCurrentTheme(resolvedTheme);
        }
    }, [resolvedTheme]);

    if (!mounted) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' className="focus-visible:ring-0 focus-visible:ring-offset-0 text-white hover:bg-white/20">
                    {currentTheme === 'system' ? (
                        <SunMoon />
                    ) : currentTheme === 'dark' ? (
                        <MoonIcon />
                    ) : (
                        <SunIcon />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* ✅ Fix: Use `DropdownMenuRadioGroup` for exclusive selection */}
                <DropdownMenuRadioGroup value={currentTheme} onValueChange={(value) => {
                    setTheme(value);
                    setCurrentTheme(value);
                }}>
                    <DropdownMenuRadioItem value="system">
                        System
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                        Dark
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="light">
                        Light
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>

            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default MoodToggle;