import React, { FC, InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
    onChange?: (value: string) => void;
};

const NumberInput: FC<Props> = (props) => {
    const { onChange, ...restProps } = props;

    function inputChange(e: React.ChangeEvent<HTMLInputElement>) {
        let parsedValue = e.target.value.replace(/(\d)-/g, "$1");
        if(parsedValue === '-') parsedValue = '';
        onChange && onChange(parsedValue);
    }

    return <input onChange={inputChange} {...restProps} />;
};

export default NumberInput;
