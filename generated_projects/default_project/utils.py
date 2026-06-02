def validate_input(input_string: str) -> bool:
    """Check if the input string is valid for calculus operations."""
    try:
        # Check if the input is a numeric value
        float_value = float(input_string)
        # Additional checks can be added here (e.g., range checks)
        return True
    except ValueError:
        return False


def handle_error(error_msg: str) -> None:
    """Display error messages."""
    print(f"Error: {error_msg}")
