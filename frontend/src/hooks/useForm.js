import { useState } from 'react';

const useForm = (initialValues, validate) => {
  const [values,  setValues]  = useState(initialValues);
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (touched[name] && validate) {
      const fieldErrors = validate({ ...values, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (validate) {
      const fieldErrors = validate(values);
      setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
    }
  };

  const validateAll = () => {
    if (!validate) return true;
    const allErrors = validate(values);
    setErrors(allErrors);
    const allTouched = Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);
    return Object.keys(allErrors).length === 0;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return { values, errors, touched, handleChange, handleBlur, validateAll, reset, setValues };
};

export default useForm;
