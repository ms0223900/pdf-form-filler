'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export interface SignaturePadHandle {
  toDataURL: () => string | undefined;
  clear: () => void;
  isEmpty: () => boolean;
}

interface SignaturePadProps {
  penSize?: number;
  penColor?: string;
}

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  function SignaturePad({ penSize = 2, penColor = '#000000' }, ref) {
    const sigRef = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
      toDataURL: () => sigRef.current?.toDataURL(),
      clear: () => sigRef.current?.clear(),
      isEmpty: () => sigRef.current?.isEmpty() ?? true,
    }));

    return (
      <SignatureCanvas
        ref={sigRef}
        penColor={penColor}
        minWidth={penSize}
        maxWidth={penSize}
        canvasProps={{
          className:
            'h-full w-full rounded border bg-white',
        }}
      />
    );
  }
);
