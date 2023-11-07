import {Flex} from "@/providers"

const LoginLayout = ({children}) => {
    return (   
        <Flex className="flex min-h-screen flex-col items-center justify-between p-24" h="100vh">
            {children}
        </Flex>
    );
};

export default LoginLayout