
import React, { useState, useEffect } from 'react';
import type { UserProfile, Achievement } from '../types';
import { AVATAR_LIST, getAvatarById } from './avatars';
import { PencilIcon, CheckIcon, LockClosedIcon } from './icons';

interface ProfileViewProps {
    profile: UserProfile;
    achievements: Achievement[];
    onSave: (name: string, avatarId: string) => void;
}

const StatCard: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="flex flex-col items-center justify-center p-3 bg-gray-100 rounded-2xl shadow-neumorphic-inset">
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs font-semibold text-gray-500">{label}</p>
    </div>
);

const AchievementBadge: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
    <div className="flex flex-col items-center text-center">
        <div className={`relative w-20 h-20 flex items-center justify-center rounded-full shadow-neumorphic ${achievement.isAchieved ? 'bg-gray-100' : 'bg-gray-200'}`}>
            {achievement.isAchieved ? (
                <achievement.icon className="w-10 h-10 text-blue-600" />
            ) : (
                <>
                    <achievement.icon className="w-10 h-10 text-gray-400" />
                    <LockClosedIcon className="absolute w-5 h-5 text-gray-500 top-1 right-1" />
                </>
            )}
        </div>
        <p className={`mt-2 font-semibold text-sm ${achievement.isAchieved ? 'text-gray-800' : 'text-gray-500'}`}>{achievement.name}</p>
        <p className={`text-xs px-1 ${achievement.isAchieved ? 'text-gray-600' : 'text-gray-500'}`}>{achievement.description}</p>
    </div>
);


const ProfileView: React.FC<ProfileViewProps> = ({ profile, achievements, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(profile.name);
    const [avatarId, setAvatarId] = useState(profile.avatarId);
    
    useEffect(() => {
        setName(profile.name);
        setAvatarId(profile.avatarId);
    }, [profile]);

    const handleSave = () => {
        onSave(name, avatarId);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setName(profile.name);
        setAvatarId(profile.avatarId);
        setIsEditing(false);
    }

    const AvatarComponent = getAvatarById(avatarId);

    return (
        <div className="w-full h-full bg-gray-100 overflow-y-auto pb-24 no-scrollbar">
            <div className="max-w-md mx-auto p-4 space-y-6">
                <h1 className="text-3xl font-bold text-gray-800 pt-4 pb-2">Profile</h1>

                <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-6 flex flex-col items-center gap-4">
                    <div className="relative w-32 h-32 rounded-full shadow-neumorphic-inset p-2">
                        <AvatarComponent className="w-full h-full rounded-full" />
                    </div>
                    {isEditing ? (
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full text-center text-2xl font-bold bg-gray-200 rounded-lg py-2 px-3 shadow-neumorphic-inset focus:outline-none"
                        />
                    ) : (
                        <h2 className="text-3xl font-bold text-gray-800">{name}</h2>
                    )}
                    
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full shadow-neumorphic active:shadow-neumorphic-inset">
                            <PencilIcon className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-semibold text-gray-700">Edit Profile</span>
                        </button>
                    ) : (
                        <div className="w-full flex flex-col items-center gap-4">
                            <p className="font-semibold text-gray-600">Choose Avatar</p>
                             <div className="flex flex-wrap justify-center gap-3">
                                {AVATAR_LIST.map(avatar => (
                                    <button key={avatar.id} onClick={() => setAvatarId(avatar.id)} className={`w-14 h-14 rounded-full p-1 transition-all ${avatarId === avatar.id ? 'shadow-neumorphic-inset' : 'shadow-neumorphic'}`}>
                                        <avatar.component className="w-full h-full" />
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-4 mt-2">
                                <button onClick={handleCancel} className="px-6 py-2 bg-gray-100 rounded-full shadow-neumorphic active:shadow-neumorphic-inset font-semibold text-gray-700">Cancel</button>
                                <button onClick={handleSave} className="px-6 py-2 bg-blue-500 rounded-full shadow-md text-white font-bold">Save</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 px-2">Stats</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <StatCard label="Total" value={profile.stats.total} />
                        <StatCard label="Animals" value={profile.stats.Animal} />
                        <StatCard label="Plants" value={profile.stats.Plant} />
                        <StatCard label="Landmarks" value={profile.stats.Landmark} />
                        <StatCard label="Food" value={profile.stats.Food} />
                        <StatCard label="Objects" value={profile.stats.Object} />
                        <StatCard label="Artwork" value={profile.stats.Artwork} />
                        <StatCard label="Vehicles" value={profile.stats.Vehicle} />
                        <StatCard label="Fashion" value={profile.stats.Fashion} />
                    </div>
                </div>

                <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 px-2">Achievements</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-6 gap-x-2">
                        {achievements.map(ach => <AchievementBadge key={ach.id} achievement={ach} />)}
                    </div>
                </div>
            </div>
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default ProfileView;