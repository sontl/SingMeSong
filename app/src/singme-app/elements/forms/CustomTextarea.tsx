// src/singme-app/elements/forms/CustomTextarea.tsx
import React, { useState, useEffect } from 'react';

interface CustomTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number;
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
  name?: string;
  id?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
}

const CustomTextarea: React.FC<CustomTextareaProps> = ({
  maxLength = 200,
  placeholder = 'Enter text here',
  defaultValue = '',
  rows = 6,
  name = 'textarea',
  id = 'textarea',
  value,
  onChange,
}) => {
  const [textValue, setTextValue] = useState(value || defaultValue);
  const [charCount, setCharCount] = useState((value || defaultValue).length);

  useEffect(() => {
    if (value !== undefined) {
      setTextValue(value);
      setCharCount(value.length);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setTextValue(newValue);
      setCharCount(newValue.length);
      onChange?.(e);
    }
  };

  return (
    <div className='relative'>
      <textarea
        className='w-full rounded border border-stroke bg-gray py-3 pl-4.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary'
        name={name}
        id={id}
        rows={rows}
        placeholder={placeholder}
        value={textValue}
        onChange={handleChange}
        maxLength={maxLength}
      />
      <div className='absolute bottom-4 right-4 text-sm text-gray-500'>
        {charCount}/{maxLength}
      </div>
    </div>
  );
};

export default CustomTextarea;
