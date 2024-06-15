import React, { useEffect, useState } from 'react'
import * as yup from "yup"
import axios from 'axios'

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
    fullNameTooShort: 'full name must be at least 3 characters',
    fullNameTooLong: 'full name must be at most 20 characters',
    sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.
const schema = yup.object().shape({
    fullName: yup
        .string()
        .trim()
        .min(3, validationErrors.fullNameTooShort)
        .max(20, validationErrors.fullNameTooLong)
        .required(),
    size: yup
        .string()
        .required(validationErrors.sizeIncorrect)
})

// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
    { topping_id: '1', text: 'Pepperoni' },
    { topping_id: '2', text: 'Green Peppers' },
    { topping_id: '3', text: 'Pineapple' },
    { topping_id: '4', text: 'Mushrooms' },
    { topping_id: '5', text: 'Ham' },
]
const getDefaultFormValues = () => {
    return {
        fullName: '',
        size: '',
        toppings: []
    }
}

export default function Form() {
    const [formValues, setFormValues] = useState(getDefaultFormValues())
    const [submitDisabled, setSubmitDisabled] = useState(true)
    const [errors, setErrors] = useState({ fullName: '', size: '' })
    const [submitionResults, setSubmissionResults] = useState({ success: '', error: '' })

    useEffect(() => {
        schema.isValid(formValues)
            .then((isValid) => {
                setSubmitDisabled(!isValid)
            })
    }, [formValues])

    const handleChange = (evt) => {
        const { id, type, value, checked } = evt.target
        let newValue
        if (type == "checkbox") {
            newValue = checked ? [...formValues.toppings, id] : formValues.toppings.filter(topId => topId != id)
        } else {
            newValue = value
        }
        setFormValues({
            ...formValues,
            [type == "checkbox" ? "toppings" : id]: newValue
        })
        if (type != "checkbox") {
            yup.reach(schema, id)
                .validate(newValue)
                .then(() => {
                    setErrors({ ...errors, [id]: '' })
                })
                .catch(err => {
                    setErrors({ ...errors, [id]: err.errors[0] })
                })
        }
    }
    const handleSubmit = (evt) => {
        evt.preventDefault()
        axios.post("http://localhost:9009/api/order", formValues)
            .then(res => {
                setSubmissionResults({ success: res.data.message, error: '' })
                setFormValues(getDefaultFormValues())
            })
            .catch(err => {
                setSubmissionResults({ error: err.data.message, success: '' })
            })
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Order Your Pizza</h2>
            {submitionResults.success && <div className='success'>{submitionResults.success}</div>}
            {submitionResults.error && <div className='failure'>{submitionResults.error}</div>}

            <div className="input-group">
                <div>
                    <label htmlFor="fullName">Full Name</label><br />
                    <input
                        placeholder="Type full name"
                        id="fullName"
                        type="text"
                        onChange={handleChange}
                        value={formValues.fullName}
                    />
                </div>
                {errors.fullName && <div className='error'>{errors.fullName}</div>}
            </div>

            <div className="input-group">
                <div>
                    <label htmlFor="size">Size</label><br />
                    <select id="size" onChange={handleChange} value={formValues.size}>
                        <option value="">----Choose Size----</option>
                        {/* Fill out the missing options */}
                        {['Small', 'Medium', 'Large'].map((size, idx) => (
                            <option value={size[0]} key={idx} >{size}</option>
                        ))}
                    </select>
                </div>
                {errors.size && <div className='error'>{errors.size}</div>}
            </div>

            <div className="input-group">
                {/* 👇 Maybe you could generate the checkboxes dynamically */}
                {toppings.map(({ topping_id, text }) => (
                    <label key={topping_id}>
                        <input
                            id={topping_id}
                            type="checkbox"
                            onChange={handleChange}
                            checked={formValues.toppings.find(id => id == topping_id) ? true : false}
                        />
                        {text}<br />
                    </label>
                ))}
            </div>
            {/* 👇 Make sure the submit stays disabled until the form validates! */}
            <input
                type="submit"
                disabled={submitDisabled}
            />
        </form>
    )
}
