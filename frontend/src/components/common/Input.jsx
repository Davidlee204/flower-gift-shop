const Input = ({ label, name, type = 'text', value, onChange, onBlur, error, placeholder, required, icon: Icon }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={16} />
        </span>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition
          ${Icon ? 'pl-9' : ''}
          ${error
            ? 'border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-1 focus:ring-rose-200'
            : 'border-gray-300 bg-white focus:border-pink-400 focus:ring-1 focus:ring-pink-100'
          }`}
      />
    </div>
    {error && <p className="text-xs text-rose-500">{error}</p>}
  </div>
);

export default Input;
