/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      width: {
        '128': '32rem',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },      keyframes: {
        "accordion-down": {
          from: { height: '0' },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: '0' },
        },        "flash": {
          "0%, 100%": { opacity: "0" },
          "10%, 90%": { opacity: "0" },
          "50%": { opacity: "0.8" },
        },
        "lightning-flash": {
          "0%, 100%": { opacity: "0" },
          "49.9%": { opacity: "0" },
          "50%": { opacity: "0.95" },
          "52%": { opacity: "0.4" },
          "54%": { opacity: "0.9" },
          "60%": { opacity: "0" },
        },"rain": {
          "0%": { transform: "translateY(-10px) rotate(5deg)" },
          "100%": { transform: "translateY(100px) rotate(8deg)" },
        },
        "heavyRain": {
          "0%": { transform: "translateY(-20px) rotate(8deg)" },
          "100%": { transform: "translateY(120px) rotate(8deg)" },
        },
        "wind": {
          "0%": { transform: "translateX(-100px)", opacity: "0" },
          "10%": { opacity: "0.8" },
          "80%": { opacity: "0.8" },
          "100%": { transform: "translateX(300px)", opacity: "0" },
        },
        "global-wind": {
          "0%": { backgroundPosition: "0px 0px" },
          "100%": { backgroundPosition: "1000px 0px" },
        },
        "fog": {
          "0%": { opacity: "0.2" },
          "50%": { opacity: "0.5" },
          "100%": { opacity: "0.2" },
        },
        "snow": {
          "0%": { transform: "translate(0, -10px)" },
          "100%": { transform: "translate(10px, 100px)" },
        },
        "float": {
          "0%": { transform: "translateX(0px)" },
          "50%": { transform: "translateX(20px)" },
          "100%": { transform: "translateX(0px)" },
        },        "earthquake": {
          "0%, 100%": { transform: "translate(-50%, -50%) rotate(0deg)" },
          "10%": { transform: "translate(calc(-50% - 15px), calc(-50% - 7px)) rotate(-1.0deg)" },
          "20%": { transform: "translate(calc(-50% + 14px), calc(-50% + 6px)) rotate(0.8deg)" },
          "30%": { transform: "translate(calc(-50% - 12px), calc(-50% + 8px)) rotate(-0.6deg)" },
          "40%": { transform: "translate(calc(-50% + 10px), calc(-50% - 10px)) rotate(1.0deg)" },
          "50%": { transform: "translate(calc(-50% - 13px), calc(-50% + 7px)) rotate(-0.8deg)" },
          "60%": { transform: "translate(calc(-50% + 12px), calc(-50% + 5px)) rotate(0.7deg)" },
          "70%": { transform: "translate(calc(-50% - 10px), calc(-50% - 6px)) rotate(-0.7deg)" },
          "80%": { transform: "translate(calc(-50% + 9px), calc(-50% + 8px)) rotate(0.5deg)" },
          "90%": { transform: "translate(calc(-50% - 11px), calc(-50% - 9px)) rotate(-0.6deg)" }
        },
        "crack": {
          "0%": { width: "0", opacity: "0" },
          "5%": { opacity: "0.7" },
          "100%": { width: "100%", opacity: "1" }
        },
        "aftershock": {
          "0%": { opacity: "0.5", transform: "scale(0)" },
          "70%": { opacity: "0.7" },
          "100%": { opacity: "0", transform: "scale(1.5)" }
        },
        "flicker": {
          "0%": { transform: "scaleY(0.8) scaleX(0.9) translateY(0)", opacity: "0.8" },
          "100%": { transform: "scaleY(1.3) scaleX(1.15) translateY(-8px)", opacity: "1" }
        },
        "ember": {
          "0%": { transform: "translate(0, 0)", opacity: "1" },
          "50%": { opacity: "0.8" },
          "100%": { transform: "translate(75px, -150px)", opacity: "0" }
        },
        "rise": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0.7" },
          "100%": { transform: "translateY(-300px) scale(3)", opacity: "0" }
        },
        "waterRise": {
          "0%, 100%": { height: "300px" },
          "50%": { height: "320px" }
        },
        "waveMove": {
          "0%": { transform: "translateX(-50px) scaleX(0.8)" },
          "100%": { transform: "translateX(50px) scaleX(1.2)" }
        },
        "floodRipple": {
          "0%": { transform: "scale(0.3)", opacity: "0.7" },
          "100%": { transform: "scale(2)", opacity: "0" }
        },
        "debrisFloat": {
          "0%": { transform: "translateX(0) rotate(0deg)" },
          "50%": { transform: "translateX(30px) rotate(10deg)" },
          "100%": { transform: "translateX(-20px) rotate(-5deg)" }
        },
      },      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "flash": "flash 2s infinite",
        "lightning-flash": "lightning-flash 4s infinite",
        "rain": "rain 1s linear infinite",
        "heavyRain": "heavyRain 0.8s linear infinite",
        "wind": "wind 3s linear infinite",
        "global-wind": "global-wind 30s linear infinite",
        "fog": "fog 8s ease-in-out infinite",
        "snow": "snow 5s linear infinite",
        "float": "float 15s ease-in-out infinite",
        "earthquake": "earthquake 0.4s linear infinite",
        "crack": "crack 1.5s ease-out forwards",
        "aftershock": "aftershock 3s ease-out infinite",
        "flicker": "flicker 0.8s ease-in-out infinite alternate",
        "ember": "ember 2.5s linear infinite",
        "rise": "rise 3.5s linear infinite",
        "waterRise": "waterRise 10s ease-in-out infinite",
        "waveMove": "waveMove 6s ease-in-out infinite alternate",
        "floodRipple": "floodRipple 3s infinite",
        "debrisFloat": "debrisFloat 8s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
