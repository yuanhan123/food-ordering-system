import React from 'react';
import {Alert, Box, AlertIcon, AlertTitle, AlertDescription, CloseButton} from '@/providers';

export default function AlertItem({status, message, onClose}){
    
    return(
        <Alert status={status}>
            <AlertIcon />
            <Box>
                <AlertTitle data-testid="status">{status}</AlertTitle>
                <AlertDescription data-testid="message">{message}</AlertDescription>
            </Box>
            <CloseButton
                alignSelf='flex-start'
                position='relative'
                right={-1}
                top={-1}
                onClick={onClose}
            />
        </Alert>
    )
}