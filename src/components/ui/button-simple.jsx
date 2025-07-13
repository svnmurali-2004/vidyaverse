import * as React from "react";

const Button = React.forwardRef((props, ref) => {
  return <button ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button };
