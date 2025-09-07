"use client";

import React, {useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { selectCurrentUser } from "@/store/userSlice";
import { UserCircleIcon, EnvelopeIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";

export default function UserInfoCard() {
  const [loading] = useState(false);
  const user = useSelector((state: RootState) => selectCurrentUser(state));



  if (loading) return <p className="text-gray-700 dark:text-white/80">Loading user info...</p>;
  if (!user) return <p className="text-red-500 dark:text-red-400">No user data available.</p>;

  return (
    <div className="p-6 border border-gray-200 bg-white rounded-2xl shadow-md dark:border-gray-800 dark:bg-white/[0.03] transition-colors duration-300">
      <div className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:text-left gap-6">
        {/* Avatar Placeholder */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-semibold">
          {user.name[0]}{user.lastName[0]}
        </div>

        <div className="flex-1">
          <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
            {user.name} {user.lastName}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Profile Overview
          </p>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:gap-x-24">
            <InfoItem
              label="First Name"
              value={user.name}
              icon={<UserCircleIcon className="w-5 h-5 text-indigo-500" />}
            />
            <InfoItem
              label="Last Name"
              value={user.lastName}
              icon={<UserCircleIcon className="w-5 h-5 text-indigo-500" />}
            />
            <InfoItem
              label="Email Address"
              value={user.email}
              icon={<EnvelopeIcon className="w-5 h-5 text-emerald-500" />}
            />
            <InfoItem
              label="Role"
              value={user.role}
              icon={<ShieldCheckIcon className="w-5 h-5 text-rose-500" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800 dark:text-white">{value}</p>
      </div>
    </div>
  );
}