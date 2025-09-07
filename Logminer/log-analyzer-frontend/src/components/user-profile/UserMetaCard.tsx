'use client';

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { selectCurrentUser } from "@/store/userSlice";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

interface User {
  idUser: number;
  name: string;
  lastName: string;
  email: string;
  role: string;
}

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();

  // Récupère currentUser via le selector
  const currentUser = useSelector((state: RootState) => selectCurrentUser(state));

  // Initialise le state local avec currentUser ou un objet vide
  const [user, setUser] = useState<User>(
    currentUser ?? { idUser: 0, name: "", lastName: "", email: "", role: "" }
  );

  // Synchronise le state local si currentUser change
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Saving changes...", user);

    fetch(`http://localhost:8080/user/${user.idUser}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors de la sauvegarde");
        closeModal();
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-3">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {user.name} {user.lastName}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
          <Button variant="outline" onClick={openModal}>Edit</Button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h4 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Personal Information
          </h4>
          <form className="flex flex-col gap-4">
            <div>
              <Label className="mb-1">First Name</Label>
              <Input name="name" value={user.name} onChange={handleChange} />
            </div>

            <div>
              <Label className="mb-1">Last Name</Label>
              <Input name="lastName" value={user.lastName} onChange={handleChange} />
            </div>

            <div>
              <Label className="mb-1">Email</Label>
              <Input name="email" value={user.email} onChange={handleChange} />
            </div>

            <div>
              <Label className="mb-1">Role</Label>
              <Input name="role" value={user.role} onChange={handleChange} />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={closeModal}>Close</Button>
              <Button type="button" onClick={handleSave}>Save</Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
