# Admin Guide: Adding Movies

Access the admin page at `/admin` to add new movies to your database.

## Required Fields

### Movie Details
- **Title** (required): The movie title (e.g., "The Dream Master")
- **Video URL** (required): Full URL to the video (e.g., "https://www.youtube.com/embed/abc123")
- **Thumbnail** (required): Upload an image file (JPG, PNG, etc.) - will be saved to `/public/thumbnails/`

### Optional Fields

#### Movie Details
- **Year**: Release year (defaults to current year)
- **Description**: Movie description/synopsis

#### Creator Details
**Option 1: Select Existing Creator**
- **Select Existing Creator**: Dropdown to choose from creators already in the database

**Option 2: Create New Creator**
- **Creator Name**: Full name of the creator (e.g., "John Smith")
- **Creator Slug**: URL-friendly version (auto-generated from name, but editable)
- **Creator Bio**: Short biography
- **Avatar URL**: Profile picture URL
- **Twitter**: Twitter handle (e.g., "@johndoe")
- **Instagram**: Instagram handle (e.g., "@johndoe")
- **Website**: Personal website URL

*Note: You can either select an existing creator OR create a new one, not both.*

#### Genres
- **Select Existing Genres**: Checkboxes for genres already in the database
- **Add New Genres**: Text inputs to create new genres

## How It Works

1. **Creator Handling**: 
   - **Option 1**: Select an existing creator from the dropdown
   - **Option 2**: Enter a new creator name - it checks if a creator with that slug already exists
   - If not, it creates a new creator record with all the details you provide
   - If yes, it uses the existing creator

2. **Genre Handling**:
   - Existing genres are linked directly
   - New genres are created automatically with auto-generated slugs
   - All genres are linked to the movie via the junction table

3. **Movie Creation**:
   - Creates the movie record with auto-generated slug from title
   - Links to creator if provided
   - Creates all genre relationships

## URL Format Examples

### Video URLs
- YouTube: `https://www.youtube.com/embed/VIDEO_ID`
- Vimeo: `https://player.vimeo.com/video/VIDEO_ID`
- Direct MP4: `https://example.com/video.mp4`

### Image Uploads
- **Thumbnail**: Upload JPG, PNG, or other image files directly
- Files are automatically saved to `/public/thumbnails/` with the movie's slug as filename
- Example: Movie "The Dream Master" → `/thumbnails/the-dream-master.jpg`

### Social Media
- Twitter: `@username` (without https://)
- Instagram: `@username` (without https://)
- Website: `https://example.com`

## Tips

1. **Slugs**: The system auto-generates URL-friendly slugs, but you can edit them
2. **Genres**: You can select multiple existing genres and add multiple new ones
3. **Creators**: If a creator already exists, just enter their name and the system will find them
4. **Validation**: Required fields are marked with asterisks (*)
5. **Success**: After successful submission, the form clears and shows a success message

## Error Handling

If something goes wrong:
- Check the browser console for detailed error messages
- Ensure all required fields are filled
- Verify URLs are valid and accessible
- Make sure creator slugs are unique 