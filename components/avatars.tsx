
import React from 'react';

const Avatar1 = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="40" cy="40" r="40" fill="#F0F0F0"/>
        <path d="M40 48C48.8366 48 56 40.8366 56 32C56 23.1634 48.8366 16 40 16C31.1634 16 24 23.1634 24 32C24 40.8366 31.1634 48 40 48Z" fill="#60A5FA"/>
        <path d="M20 72C20 60.9543 28.9543 52 40 52C51.0457 52 60 60.9543 60 72H20Z" fill="#93C5FD"/>
    </svg>
);

const Avatar2 = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="40" cy="40" r="40" fill="#FBCFE8"/>
        <path d="M40 48C48.8366 48 56 40.8366 56 32C56 23.1634 48.8366 16 40 16C31.1634 16 24 23.1634 24 32C24 40.8366 31.1634 48 40 48Z" fill="#F472B6"/>
        <path d="M20 72C20 60.9543 28.9543 52 40 52C51.0457 52 60 60.9543 60 72H20Z" fill="#F9A8D4"/>
    </svg>
);

const Avatar3 = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="40" cy="40" r="40" fill="#D1FAE5"/>
        <path d="M40 48C48.8366 48 56 40.8366 56 32C56 23.1634 48.8366 16 40 16C31.1634 16 24 23.1634 24 32C24 40.8366 31.1634 48 40 48Z" fill="#34D399"/>
        <path d="M20 72C20 60.9543 28.9543 52 40 52C51.0457 52 60 60.9543 60 72H20Z" fill="#6EE7B7"/>
    </svg>
);

const Avatar4 = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="40" cy="40" r="40" fill="#FEE2E2"/>
        <path d="M40 48C48.8366 48 56 40.8366 56 32C56 23.1634 48.8366 16 40 16C31.1634 16 24 23.1634 24 32C24 40.8366 31.1634 48 40 48Z" fill="#F87171"/>
        <path d="M20 72C20 60.9543 28.9543 52 40 52C51.0457 52 60 60.9543 60 72H20Z" fill="#FCA5A5"/>
    </svg>
);

const Avatar5 = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="40" cy="40" r="40" fill="#FEF3C7"/>
        <path d="M40 48C48.8366 48 56 40.8366 56 32C56 23.1634 48.8366 16 40 16C31.1634 16 24 23.1634 24 32C24 40.8366 31.1634 48 40 48Z" fill="#FBBF24"/>
        <path d="M20 72C20 60.9543 28.9543 52 40 52C51.0457 52 60 60.9543 60 72H20Z" fill="#FCD34D"/>
    </svg>
);

const Avatar6 = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="40" cy="40" r="40" fill="#E0E7FF"/>
        <path d="M40 48C48.8366 48 56 40.8366 56 32C56 23.1634 48.8366 16 40 16C31.1634 16 24 23.1634 24 32C24 40.8366 31.1634 48 40 48Z" fill="#818CF8"/>
        <path d="M20 72C20 60.9543 28.9543 52 40 52C51.0457 52 60 60.9543 60 72H20Z" fill="#A5B4FC"/>
    </svg>
);


export const AVATAR_LIST = [
    { id: 'avatar1', component: Avatar1 },
    { id: 'avatar2', component: Avatar2 },
    { id: 'avatar3', component: Avatar3 },
    { id: 'avatar4', component: Avatar4 },
    { id: 'avatar5', component: Avatar5 },
    { id: 'avatar6', component: Avatar6 },
];

export const getAvatarById = (id: string) => {
    return AVATAR_LIST.find(avatar => avatar.id === id)?.component || Avatar1;
};