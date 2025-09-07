'use client';

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

export type User = {
  idUser: number;
  name: string;
  lastName: string;
  email: string;
  role: string;
};

type Props = {
  users: User[];
  onDelete?: (user: User) => void;
  onEdit?: (user: User) => void;
};

export default function BasicTableOne({ users, onDelete, onEdit }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 dark:bg-gray-800">
                <TableCell
                  isHeader
                  className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  First Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Last Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Role
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
                

            <TableBody className="divide-y divide-gray-100">
              {users.map((user) => (
                <TableRow key={user.idUser}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    {user.name}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    {user.lastName}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    {user.role}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => onEdit?.(user)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        📝
                      </button>
                      <button
                      onClick={() => onDelete?.(user)} // 👈 passer l'objet user complet
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      ❌
                    </button>

                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
