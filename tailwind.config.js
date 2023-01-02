/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["src/pages/**/*.{js,jsx,ts,tsx}", "src/components/**/*.{js,jsx,ts,tsx}", "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}", "node_modules/tailwind-datepicker-react/dist/**/*.js"],
    theme: {
        extend: {
            backgroundImage: {
                polka: "radial-gradient(#1151a8 0.8px, transparent 0.8px), radial-gradient(#1151a8 0.8px, #eeeeee 0.8px)",
            },
        },
    },
    plugins: [require("flowbite/plugin")],
};
