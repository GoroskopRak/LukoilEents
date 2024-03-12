export const getAuth = () => {
    return {
        auth: {
            username: localStorage?.getItem('username') as string,
            password: localStorage?.getItem('password') as string
      }
    }
    
}