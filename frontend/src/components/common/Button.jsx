const variants = {
  primary:   'bg-pink-500 hover:bg-pink-600 text-white disabled:bg-pink-300',
  secondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
  danger:    'bg-rose-500 hover:bg-rose-600 text-white disabled:bg-rose-300',
  ghost:     'text-pink-500 hover:bg-pink-50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = ({
  children, variant = 'primary', size = 'md',
  type = 'button', disabled = false, loading = false,
  onClick, className = '', fullWidth = false,
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition
      focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-1
      disabled:cursor-not-allowed
      ${variants[variant]} ${sizes[size]}
      ${fullWidth ? 'w-full' : ''}
      ${className}`}
  >
    {loading && (
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
    )}
    {children}
  </button>
);

export default Button;
