'use client'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

import Form from 'next/form'

export default function LoginForm({ handleSubmit }: { handleSubmit: (formData: FormData) => void }) {
    const [payload, setPayload] = useState({
        userId: "",
        password: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPayload({
            ...payload,
            [e.target.name]: e.target.value
        });
        console.log(payload);
    };

    return (
        <Form action={handleSubmit}>

            {/* <label htmlFor="userId">ID</label>
            <Input type="text" placeholder="ID" name="userId" />

            <label htmlFor="password">Password</label>
            <Input type="password" placeholder="Password" name="password" /> */}

            <Input type="text" placeholder="ID" name="userId" required onChange={handleChange}/>
            <Input type="password" placeholder="Password" name="password" required onChange={handleChange}/>
            
            <Button type="submit">Login</Button>
        </Form>
    );
  
  }