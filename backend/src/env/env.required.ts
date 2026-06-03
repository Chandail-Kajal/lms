export const REQUIRED_ENV: Record<
  string,
  string[]
> = {
  development: [
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    
        "NODE_ENV",
      
        "ALLOWED_ORIGINS",
    
       
       
        "DATABASE_URL",
        
    
        
       
       
    
    
        "MAIL_HOST",
        "MAIL_PORT",
        "MAIL_USER",
        "MAIL_PASS",
        "MAIL_FROM",
        "MAIL_SECURITY",
    
       
        "LOG_LEVEL"
    
  ],

  test: [
    
  ],

  production: [
   
    

    

    

    

    
  ],
};