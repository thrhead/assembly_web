/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    swcMinify: true,
    workboxOptions: {
        disableDevLogs: true,
    },
});

const nextConfig = {
    serverExternalPackages: ['@prisma/client', 'bcryptjs'],
    experimental: {
        reactCompiler: true,
        turbopack: {},
    },
};

module.exports = withPWA(nextConfig);
