# Use lightweight nginx alpine image
FROM nginx:alpine

# Remove the default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom configuration
COPY nginx.conf /etc/nginx/conf.d/

# Copy all static assets to the container html directory
COPY . /usr/share/nginx/html/

# Expose the configured port
EXPOSE 3000

# Start Nginx and keep it running in the foreground
CMD ["nginx", "-g", "daemon off;"]
