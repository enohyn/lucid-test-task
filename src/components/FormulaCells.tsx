import React, { useRef, useState } from 'react';
import { Input, List, Tag, Space, Typography, type InputRef } from 'antd';
import { fetchSuggestions, type Suggestion } from '../services/api';
import { useFormulaStore } from '../store/causal-functionalities';
import { useQuery } from '@tanstack/react-query';

export function FormulaCell({ rowKey }: { rowKey: string }) {
    const { tokens, addChip, addOperator, removeToken } = useFormulaStore();
    const [inputText, setInputText] = useState('');
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<InputRef>(null);

    const { data } = useQuery<Suggestion[]>({
        queryKey: ['suggestions', inputText],
        queryFn: fetchSuggestions,
        enabled: !!inputText,
    });

    const suggestions = data
        ? data
            .filter(i => i.name.toLowerCase().includes(inputText.toLowerCase()))
            .map(i => ({ id: i.id, value: typeof i.value === 'number' ? i.value : parseFloat(i.value) || 0, label: i.name }))
        : [];

    const onKeyDown: React.KeyboardEventHandler = e => {
        if (e.key === 'Enter' && inputText) {
            const first = suggestions[0];
            if (first) {
                addChip(rowKey, { id: first.id, value: first.value, label: first.label, type: 'chip' });
            } else {
                addChip(rowKey, { id: Date.now().toString(), value: parseFloat(inputText) || 0, label: inputText, type: 'chip' });
            }
            setInputText(''); setFocused(false);
        } else if (e.key === 'Backspace' && !inputText) {
            e.preventDefault();
            const all = tokens[rowKey] || [];
            const last = all[all.length - 1];
            if (last) removeToken(rowKey, last.id);
            setTimeout(() => inputRef.current?.focus(), 0);
        } else if (/^[+\-*/]$/.test(e.key)) {
            e.preventDefault();
            addOperator(rowKey, e.key);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };
    const invalid = (tokens[rowKey] || []).some((t, i, arr) =>
        t.type === 'chip' && arr[i + 1]?.type === 'chip'
    );
    return (
        <div
            className={`bg-white py-1 px-1 wrap-normal ${invalid ? 'border border-red-500' : ''}`}>
            <Space wrap align="center" className='gap-x-0.5' >
                {(tokens[rowKey] || []).map(t =>
                    t.type === 'chip' ? (
                        <Tag className='w-fit !mr-0' key={t.id} closable onClose={() => removeToken(rowKey, t.id)}>{t.label}</Tag>
                    ) : (
                        <Typography.Text key={t.id}>{t.label}</Typography.Text>
                    )
                )}
                <div className='relative'>
                    <Input
                        ref={inputRef}
                        value={inputText}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setTimeout(() => setFocused(false), 200)}
                        onChange={e => setInputText(e.target.value)}
                        onKeyDown={onKeyDown}
                        style={{ width: "100%" }}
                        placeholder={`${invalid ? 'Incorrect formula' : "Place your formula here"}`}
                        className='!pl-0 border-0 focus:ring-0 focus:border-none !border-none !shadow-none'
                    />
                    {focused && suggestions.length > 0 && (
                        <List
                            size="small"
                            className='overflow-auto'
                            bordered
                            dataSource={suggestions}
                            style={{ position: 'absolute', zIndex: 10, background: '#fff', marginTop: 4, maxWidth: 240, maxHeight: 240 }}
                            renderItem={item => (
                                <List.Item onMouseDown={() => {
                                    addChip(rowKey, { id: item.id, value: item.value, label: item.label, type: 'chip' });
                                    setInputText('');
                                    setTimeout(() => inputRef.current?.focus(), 0);
                                }} style={{ cursor: 'pointer' }}>
                                    {item.label}
                                </List.Item>
                            )}
                        />
                    )}
                </div>
            </Space>

        </div>
    );
}