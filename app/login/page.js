'use client'
import LoginLayout from '@/components/LoginLayout';
import {
    Stack,
    Text,
    Link
} from '@/providers';
import LoginForm from '@/components/LoginForm';

export default function Login() {
    return (
        <LoginLayout>
            <LoginForm isCustomer={true}>
                <Stack spacing="6" textAlign="center">
                    <Text color="fg.muted">
                        Do not have an account? <Link href="/sign-up" className='text-custom-green'>Sign up</Link>
                    </Text>
                </Stack>
            </LoginForm>
        </LoginLayout>
    )
}
