# Use an official Node.js runtime as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

RUN apt-get update 

RUN apt-get install -y python3 make gcc g++ curl postgresql-contrib libnotify-dev xauth xvfb 

RUN apt-get install -y libgtk2.0-0 libgtk-3-0 libgbm-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 

RUN apt-get install -y wget 

RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb 

RUN apt-get install -y ./google-chrome-stable_current_amd64.deb

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Generate the Prisma Client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Expose the port that your Next.js app will run on (usually 3000)
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
