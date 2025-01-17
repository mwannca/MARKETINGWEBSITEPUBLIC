// src/app/templates/Templates.tsx

'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {createTemplate} from "@/app/dashboard/actions";
import {Textarea} from "@headlessui/react";

export default function Templates() {
    const [htmlContent, setHtmlContent] = useState<string>('');
    const [templateName, setTemplateName] = useState<string>('');
    const [apiKeyId, setApiKeyId] = useState<string>(''); // You might want to fetch and select from existing API keys

    const handleCreateTemplate = async () => {
        if (!apiKeyId || !templateName || !htmlContent) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            await createTemplate(apiKeyId, htmlContent, templateName);
            toast.success('Template created successfully');
        } catch (error) {
            toast.error('Failed to create template');
        }
    };

    return (
        <div className="templates">
            <h1 className="text-2xl font-semibold">Manage Templates</h1>
            <Input
                className="my-2"
                value={apiKeyId}
                onChange={(e) => setApiKeyId(e.target.value)}
                placeholder="API Key ID"
            />
            <Input
                className="my-2"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template Name"
            />
            <Textarea
                className="my-2"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="HTML Content"
            />
            <Button onClick={handleCreateTemplate}>Create Template</Button>
        </div>
    );
}
